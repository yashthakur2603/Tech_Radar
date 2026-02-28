import { GoogleGenAI } from '@google/genai';
import { getPendingJobs, updateJobStatus, createNotification } from './db';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const getGeminiApiKey = () => {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  return key;
};

// Polling interval in milliseconds
const POLL_INTERVAL = 5000;

export const startWorker = () => {
  console.log('Background worker started.');

  setInterval(async () => {
    const jobs = getPendingJobs();

    for (const job of jobs) {
      try {
        console.log(`Processing job ${job.id}...`);

        // Mark as processing
        updateJobStatus(job.id, 'processing');

        const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });

        const prompt = `
Use Google Search grounding to scan the internet and find the latest, most relevant skills and technologies!

Return ONLY valid JSON (no markdown) in this exact structure:
{
  "run_date": "ISO string",
  "current_profile_summary": "string",
  "recommended_technologies": [
    {
      "technology_name": "string",
      "category": "AI Analytics|BI|Data Engineering|Governance|Cloud|Orchestration|Data Quality|Semantic Layer",
      "short_description": "string",
      "why_relevant_for_me": "string",
      "priority": "High|Medium|Low",
      "learning_difficulty": "Easy|Medium|Hard",
      "market_signal": "High|Medium|Low",
      "project_idea": "string",
      "sources": ["https://example.com"]
    }
  ],
  "top_5_next_skills": ["string"]
}

Rules:
- Recommend 6 to 8 technologies.
- Sort technologies by priority: High first, then Medium, then Low.
- Search the internet using Google Search to ensure the market signals are current.
- Prioritize practical enterprise adoption (BI, analytics engineering, product analytics, governance, data quality, cloud data stack, AI automation for analysts).
- Tailor to the CV and target role.
- Include real source URLs.
- Do not include markdown fences.

CV:
${job.cvContent}

Target Role:
${job.targetRole}
`.trim();

        // Simulate artificial delay to test asynchronous behavior
        await new Promise((resolve) => setTimeout(resolve, 10000));

        const response = await ai.models.generateContent({
          model: 'models/gemini-2.5-flash',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });

        const raw =
          typeof (response as any).text === 'function'
            ? (response as any).text()
            : (response as any).text;

        let jsonText = String(raw || '').trim();

        // Strip out markdown code blocks if the model ignored our instructions
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }

        // Sanitize any remaining bad control characters (tabs, etc) that might break JSON.parse
        jsonText = jsonText.replace(/[\u0000-\u0009\u000B-\u001F]/g, '');

        if (!jsonText) {
          throw new Error('Gemini returned empty response');
        }

        let result: any;
        try {
          result = JSON.parse(jsonText);
        } catch (parseError: any) {
          console.error("Failed to parse Gemini JSON:", jsonText.substring(0, 500) + '...[truncated]');
          throw new Error(`JSON Parse Error: ${parseError.message}`);
        }

        // Save result and mark complete
        updateJobStatus(job.id, 'completed', JSON.stringify(result));

        // Create notification
        createNotification(
          uuidv4(),
          job.id,
          `Your analysis for ${job.targetRole} is complete!`
        );

        console.log(`Job ${job.id} completed successfully.`);

      } catch (error: any) {
        console.error(`Failed processing job ${job.id}:`, error);
        updateJobStatus(job.id, 'failed', null, error?.message || 'Unknown error');

        createNotification(
          uuidv4(),
          job.id,
          `Your analysis for ${job.targetRole} failed. Please try again.`
        );
      }
    }
  }, POLL_INTERVAL);
};
