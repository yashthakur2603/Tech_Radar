import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

import { v4 as uuidv4 } from 'uuid';
import { createJob, getJob, getUnreadNotifications, markNotificationsRead } from './src/db.js';
import { startWorker } from './src/worker.js';
async function startServer() {
  startWorker();

  const app = express();
  const upload = multer({ storage: multer.memoryStorage() });

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const getGeminiApiKey = () => {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    if (!key) throw new Error('GEMINI_API_KEY is not set');
    return key;
  };

  // ---------- API routes (must be BEFORE Vite middleware) ----------
  app.get('/api/test', (_req, res) => {
    res.json({ ok: true, route: '/api/test works' });
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, message: 'Server healthy' });
  });

  app.get('/api/keycheck', (_req, res) => {
    const k = (process.env.GEMINI_API_KEY || '').trim();
    res.json({
      present: !!k,
      prefix: k ? `${k.slice(0, 6)}...` : '',
      length: k.length,
    });
  });

  app.post('/api/analyze', upload.single('cv'), async (req, res) => {
    try {
      const { targetRole, cvText } = req.body as {
        targetRole?: string;
        cvText?: string;
      };

      let cvContent = (cvText || '').trim();

      if (req.file) {
        const parser = new PDFParse({ data: req.file.buffer });
        const parsed = await parser.getText();
        await parser.destroy();
        cvContent = (parsed?.text || '').trim();
      }

      if (!cvContent) {
        return res.status(400).json({ error: 'CV content is required.' });
      }

      if (!targetRole?.trim()) {
        return res.status(400).json({ error: 'Target role is required.' });
      }

      // create a background job instead of waiting
      const jobId = uuidv4();
      createJob(jobId, cvContent, targetRole);

      return res.json({ message: 'Analysis queued successfully', jobId });
    } catch (error: any) {
      console.error('API Error full:', error);
      console.error('API Error message:', error?.message);
      return res.status(500).json({
        error: error?.message || 'Failed to analyze CV',
      });
    }
  });

  app.get('/api/result/:id', (req, res) => {
    const job = getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    return res.json(job);
  });

  app.get('/api/notifications', (_req, res) => {
    return res.json(getUnreadNotifications());
  });

  app.post('/api/notifications/read', (_req, res) => {
    markNotificationsRead();
    return res.json({ success: true });
  });

  // ---------- Vite middleware LAST ----------
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
  });
}

startServer();