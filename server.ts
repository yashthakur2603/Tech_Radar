import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const getGeminiApiKey = () => {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    if (!key) throw new Error('GEMINI_API_KEY is not set in .env');
    return key;
};

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
            } catch (pdfError: any) {
                console.error('Detailed PDF parse error:', pdfError);
                return res.status(400).json({ error: 'Failed to parse PDF: ' + pdfError.message });
            }
        }

        if (!finalContent || !targetRole) {
            return res.status(400).json({ error: 'CV content (text or PDF) and targetRole are required' });
        }

        console.log(`Starting real-time API request for target role: ${targetRole}...`);

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
${finalContent}

Target Role:
${targetRole}
`.trim();

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            }
        });

        const raw = response.text;
        let jsonText = String(raw || '').trim();

        // Strip out markdown code blocks if the model ignored our instructions
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }

        // Sanitize any remaining bad control characters (tabs, etc) that might break JSON.parse
        jsonText = jsonText.replace(/[\u0000-\u0009\u000B-\u001F]/g, '');
        
        // Attempt to fix common JSON issues from LLMs (e.g. unquoted keys or trailing commas)
        // Note: Using a robust approach for fixing JSON using Regex can be complex,
        // but removing trailing commas is safe.
        jsonText = jsonText.replace(/,\s*([\]}])/g, '$1');

        // Extract JSON specifically if it's trapped in conversational text
        const jsonMatch = jsonText.match(/{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*}/);
        if (jsonMatch) {
            jsonText = jsonMatch[0];
        }

        if (!jsonText) {
            return res.status(500).json({ error: 'Gemini returned empty response' });
        }

        let result;
        try {
            result = JSON.parse(jsonText);
        } catch (parseError: any) {
            console.error("Failed to parse Gemini JSON:", jsonText.substring(0, 500) + '...[truncated]');
            return res.status(500).json({ error: `JSON Parse Error: ${parseError.message}` });
        }

        console.log('Real-time API request completed successfully.');
        res.json(result);

    } catch (error: any) {
        console.error('Error in /api/analyze:', error);

        let errorMessage = error?.message || 'Unknown error during analysis';
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
            errorMessage = 'Your Gemini API key has exceeded its quota limits for today.';
        } else if (errorMessage.includes('404') || errorMessage.includes('NOT_FOUND')) {
            errorMessage = 'The selected AI model does not support the required features. Please check your API configuration.';
        }
        res.status(500).json({ error: errorMessage });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server started cleanly on port ${PORT} -- background queueing is disabled.`);
});
