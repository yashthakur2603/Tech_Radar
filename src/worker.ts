import { GoogleGenAI } from '@google/genai';
import { getPendingJobs, updateJobStatus, createNotification, resetProcessingJobs } from './db';
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
  resetProcessingJobs();

  setInterval(async () => {
    const jobs = getPendingJobs();

    for (const job of jobs) {
      try {
        console.log(`Processing job ${job.id}...`);

        // Mark as processing
        updateJobStatus(job.id, 'processing');

        const client = new GoogleGenAI({ apiKey: getGeminiApiKey() });

        const prompt = `
Act as a world-class Career Strategist and Market Analyst. Use Google Search grounding to scan the current job market, industry trends, and salary benchmarks for 2025-2026.

Your goal is to provide a high-impact upskilling roadmap for the user based on their CV and target role.

Return ONLY valid JSON (no markdown) in this exact structure:
{
  "run_date": "ISO string",
  "current_profile_summary": "string",
  "recommended_technologies": [
    {
      "technology_name": "string",
      "category": "string",
      "short_description": "string",
      "why_relevant_for_me": "string",
      "priority": "High|Medium|Low",
      "learning_difficulty": "Easy|Medium|Hard",
      "market_signal": "High|Medium|Low",
      "project_idea": "string",
      "salary_impact": "High|Medium|Low",
      "sources": ["string"]
    }
  ],
  "top_5_next_skills": ["string"]
}

Strict Rules:
1. Recommend 8-10 technologies/skills.
2. YOU MUST use the latest market data and salary trends.
3. SORT the "recommended_technologies" list by "priority" (High -> Medium -> Low).
4. For each skill, explicitly state the "salary_impact" based on market research (which skills lead to the most money).
5. Focus on the "Best Fit" for the user to reach their Target Role effectively.
6. Provide specific, actionable "project_idea" for each high-priority skill.
7. Include real, clickable URLs in "sources".

CV:
${job.cvContent}

Target Role:
${job.targetRole}
`.trim();

        const response = await client.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt
        });

        const raw = response.text;

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

        // Handle specific API errors
        let errorMessage = error?.message || 'Unknown error during analysis';

        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
          errorMessage = 'Your Gemini API key has exceeded its quota limits for today. Please wait, upgrade your billing plan at Google AI Studio, or provide a new API key.';
        } else if (errorMessage.includes('404') || errorMessage.includes('NOT_FOUND')) {
          errorMessage = 'The selected AI model does not support the required features. Please check your API configuration.';
        }

        updateJobStatus(job.id, 'failed', null, errorMessage);

        createNotification(
          uuidv4(),
          job.id,
          `Analysis failed: ${errorMessage.substring(0, 50)}...`
        );
      }
    }
  }, POLL_INTERVAL);
};
