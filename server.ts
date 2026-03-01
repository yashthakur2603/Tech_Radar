import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { startWorker } from './src/worker';
import { createJob, getJob, getPendingJobs, createNotification, getUnreadNotifications, markNotificationsRead } from './src/db';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get('/api/notifications', (req, res) => {
    const notifications = getUnreadNotifications();
    const rawJobs = getPendingJobs() || [];
    const jobs = rawJobs.map((j: any) => ({ id: j.id, status: j.status, targetRole: j.targetRole }));
    res.json({ notifications, jobs });
});

app.post('/api/notifications/read', (req, res) => {
    markNotificationsRead();
    res.json({ success: true });
});

app.get('/api/result/:id', (req, res) => {
    const job = getJob(req.params.id);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status === 'completed' && job.result) {
        return res.json(JSON.parse(job.result));
    } else {
        return res.json({ status: job.status, error: job.error });
    }
});

app.post('/api/analyze', upload.single('cv'), async (req, res) => {
    try {
        const { cvText, targetRole } = req.body;
        let finalContent = cvText || '';

        if (req.file) {
            console.log('PDF file received, parsing...');
            try {
                const PDFParseClass = pdf.PDFParse || (typeof pdf === 'function' ? pdf : pdf.default);
                const parser = new PDFParseClass({ data: req.file.buffer });
                const result = await parser.getText();
                finalContent = result.text;
                console.log('PDF parsed successfully, length:', finalContent.length);
            } catch (pdfError) {
                console.error('Detailed PDF parse error:', pdfError);
                throw new Error('Failed to parse PDF: ' + (pdfError as any).message);
            }
        }

        if (!finalContent || !targetRole) {
            return res.status(400).json({ error: 'CV content (text or PDF) and targetRole are required' });
        }

        const jobId = uuidv4();
        createJob(jobId, finalContent, targetRole);

        res.json({ jobId, message: 'Analysis queued successfully' });
    } catch (error: any) {
        console.error('Error in /api/analyze:', error);
        res.status(500).json({ error: 'Failed to process CV' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    startWorker();
});
