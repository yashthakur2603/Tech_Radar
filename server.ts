<<<<<<< HEAD
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
=======
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const IS_PROD = process.env.NODE_ENV === 'production';

// Multer: memory storage for PDF uploads (no disk writes)
const upload = multer({ storage: multer.memoryStorage() });

// ─── Middleware: Body Parsers ─────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  ALL /api ROUTES MUST BE REGISTERED HERE — BEFORE vite.middlewares ⚠️
//     Vite's SPA catch-all would otherwise intercept /api requests
//     and return index.html instead of JSON.
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/health ─── quick uptime check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() });
});

// GET /api/keycheck ─── debug: is GEMINI_API_KEY loaded?
app.get('/api/keycheck', (_req, res) => {
    const key = process.env.GEMINI_API_KEY ?? '';
    res.json({
        present: key.length > 0,
        prefix: key.length > 4 ? key.slice(0, 7) + '...' : '(not set)',
    });
});

// POST /api/analyze ─── main analysis endpoint
app.post('/api/analyze', upload.single('cv'), async (req, res) => {
    try {
        // 1. Extract CV text from PDF buffer OR plain text field
        let cvText = '';

        if (req.file) {
            // Dynamically import pdf-parse (CJS default export)
            const pdfParse = (await import('pdf-parse')).default;
            const parsed = await pdfParse(req.file.buffer);
            cvText = parsed.text?.trim() ?? '';
        } else if (typeof req.body.cvText === 'string') {
            cvText = req.body.cvText.trim();
        }

        if (!cvText) {
            res.status(400).json({ error: 'No CV text or PDF file provided.' });
            return;
        }

        // 2. Validate Gemini API key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
            return;
        }

        // 3. Build Gemini prompt — strictly demands pure JSON, no markdown fences
        const prompt = `You are an expert AI technology career advisor and Business Intelligence specialist.

Analyze the following CV/resume text and return a comprehensive technology radar assessment.

CV TEXT:
---
${cvText}
---

Return ONLY a raw JSON object — no markdown, no code fences, no explanation. The JSON must exactly match this schema:
{
  "run_date": "<today ISO 8601 date>",
  "current_profile_summary": "<2-3 sentence summary of the candidate's current technology profile and strengths>",
  "recommended_technologies": [
    {
      "technology_name": "<tool or technology name>",
      "category": "<one of: Cloud Data Warehouse | Lakehouse & ML | Analytics Engineering | BI & Visualization | LLM Orchestration | Real-Time Streaming | Governed Analytics | Unified Analytics>",
      "priority": "<one of: Adopt | Trial | Assess | Hold>",
      "market_signal": "<1-2 sentences on why this technology matters in 2025-2026 enterprise data market>",
      "project_idea": "<a specific, actionable project idea this person could build to gain hands-on experience, tailored to their Electronics + Business Intelligence background>",
      "sources": ["<a relevant blog, docs URL, or resource title>"]
    }
  ],
  "top_5_next_skills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"]
}

Include 6-10 technologies across multiple priority levels. Personalize recommendations based on the actual CV content.
Do not wrap in markdown. Return pure JSON only.`;

        // 4. Call Gemini 1.5 Flash
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite',
            contents: prompt,
        });

        const rawText = response.text ?? '';

        // 5. Strip any accidental markdown fences the model might add
        const jsonText = rawText
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();

        // 6. Parse and validate JSON shape
        let radarData: unknown;
        try {
            radarData = JSON.parse(jsonText);
        } catch {
            console.error('[analyze] Failed to parse Gemini response as JSON:', jsonText.slice(0, 300));
            res.status(502).json({
                error: 'Gemini returned non-JSON output. Try again.',
                raw: jsonText.slice(0, 500),
            });
            return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.json(radarData);
    } catch (err: unknown) {
        console.error('[analyze] Unexpected error:', err);
        const message = err instanceof Error ? err.message : 'Unknown server error';
        res.status(500).json({ error: message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Vite Middleware (dev) or Static Files (prod) — MUST come AFTER /api routes
// ─────────────────────────────────────────────────────────────────────────────
async function startServer() {
    if (!IS_PROD) {
        // Development: mount Vite as middleware for HMR + asset serving
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
        console.log('🔧  Vite dev middleware mounted (SPA mode)');
    } else {
        // Production: serve the pre-built static bundle
        const staticDir = resolve(__dirname, 'dist/public');
        if (!fs.existsSync(staticDir)) {
            console.warn('⚠️  dist/public not found — run `npm run build` first');
        }
        app.use(express.static(staticDir));
        // SPA fallback for client-side routing
        app.get('*', (_req, res) => {
            res.sendFile(resolve(staticDir, 'index.html'));
        });
        console.log(`📦  Serving static build from ${staticDir}`);
    }

    app.listen(PORT, () => {
        console.log(`\n🚀  Personal Tech Radar Agent`);
        console.log(`    http://localhost:${PORT}`);
        console.log(`    /api/health    → JSON health check`);
        console.log(`    /api/keycheck  → Gemini key status`);
        console.log(`    /api/analyze   → POST multipart CV analysis\n`);
    });
}

startServer().catch((err) => {
    console.error('❌  Failed to start server:', err);
    process.exit(1);
});
>>>>>>> origin/main
