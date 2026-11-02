import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Support JSON payloads with reasonable size for text from PDFs
app.use(express.json({ limit: '20mb' }));

// Initialize GoogleGenAI client if key exists
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    ok: true,
    geminiAvailable: !!process.env.GEMINI_API_KEY,
    model: 'gemini-3.8-flash',
    localFallbackSupported: true,
  });
});

// Helper to truncate very large texts if exceeding token limits while keeping broad coverage
function prepareDocumentText(text: string, maxChars = 75000): string {
  if (!text) return '';
  if (text.length <= maxChars) return text;
  // If large, sample start, middle, and end with clear demarcations
  const sliceSize = Math.floor(maxChars / 3);
  const midStart = Math.floor(text.length / 2 - sliceSize / 2);
  return (
    text.slice(0, sliceSize) +
    '\n\n[... Document content continues ...]\n\n' +
    text.slice(midStart, midStart + sliceSize) +
    '\n\n[... Document content continues ...]\n\n' +
    text.slice(text.length - sliceSize)
  );
}

// 1. AI Summaries Endpoint
app.post('/api/ai/summarize', async (req: Request, res: Response) => {
  try {
    const { title, text, detailLevel = 'comprehensive' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Please switch to Local On-Device AI mode.',
        code: 'NO_API_KEY',
      });
    }

    const trimmedText = prepareDocumentText(text);

    const prompt = `You are an expert academic tutor and curriculum specialist. 
Your task is to analyze the following document titled "${title || 'Study Material'}" and produce an in-depth, well-organized study guide summary.

CRITICAL INSTRUCTIONS:
- Generate detailed, well-organized chapter or section summaries.
- Highlight important facts, definitions, core principles, and conceptual mechanisms.
- NEVER skip important information just to make the summary shorter. Comprehensiveness and retention are paramount.
- Structure the summary logically so students can master the subject material.

Document Text:
${trimmedText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a high-level academic professor. Output valid JSON adhering strictly to the requested schema. Ensure definitions are precise and chapter summaries contain clear paragraphs and actionable takeaways.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: {
              type: Type.STRING,
              description: 'Comprehensive executive summary of the entire document, contextualizing its main purpose and scope.',
            },
            chapters: {
              type: Type.ARRAY,
              description: 'Detailed breakdowns of each logical chapter, section, or topic within the material.',
              items: {
                type: Type.OBJECT,
                properties: {
                  chapterNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  summary: {
                    type: Type.STRING,
                    description: 'Detailed narrative breakdown of this section. Do not truncate.',
                  },
                  keyTakeaways: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Crucial bullet points students must remember.',
                  },
                  definitions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        term: { type: Type.STRING },
                        definition: { type: Type.STRING },
                        importance: { type: Type.STRING },
                      },
                      required: ['term', 'definition'],
                    },
                  },
                  formulasOrRules: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Key formulas, laws, theorems, or step-by-step rules mentioned.',
                  },
                },
                required: ['chapterNumber', 'title', 'summary', 'keyTakeaways', 'definitions'],
              },
            },
            glossary: {
              type: Type.ARRAY,
              description: 'Master list of key academic terms and definitions across the entire document.',
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  context: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            studyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable tips on how to prepare for exams on this specific content.',
            },
          },
          required: ['overview', 'chapters', 'glossary'],
        },
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(jsonText);
    res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/ai/summarize:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate summary',
      details: error.toString(),
    });
  }
});

// 2. AI Quiz Generator Endpoint
app.post('/api/ai/quiz', async (req: Request, res: Response) => {
  try {
    const { text, count = 5, difficulty = 'mixed', topic } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Please switch to Local On-Device AI mode.',
        code: 'NO_API_KEY',
      });
    }

    const trimmedText = prepareDocumentText(text);

    const prompt = `Create a high-quality educational quiz with exactly ${count} multiple-choice questions based on the provided material.
Target difficulty: ${difficulty} (use a balanced distribution if "mixed").
${topic ? `Focus on topic: ${topic}` : ''}

CRITICAL RULES:
- Exactly 4 options per question (A, B, C, D).
- Specify correctIndex (0 for option 0, 1 for option 1, 2 for option 2, 3 for option 3).
- Provide a thorough, pedagogical explanation of WHY the correct answer is right and why the distractors are wrong.
- Distractors must be plausible and grounded in the material, avoiding obviously ridiculous trick options.
- Test conceptual understanding and problem solving, not just trivial keyword matching.

Study Material:
${trimmedText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a test preparation expert creating rigorous academic multiple choice questions.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Exactly 4 distinct answer choices.',
                  },
                  correctIndex: {
                    type: Type.INTEGER,
                    description: 'Index of correct answer in the options array (0, 1, 2, or 3).',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Detailed explanation for why this answer is correct.',
                  },
                  difficulty: {
                    type: Type.STRING,
                    description: 'easy, medium, or hard',
                  },
                  topic: {
                    type: Type.STRING,
                    description: 'Specific concept or sub-topic tested.',
                  },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation', 'difficulty'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(jsonText);
    res.json(parsedData.questions || []);
  } catch (error: any) {
    console.error('Error in /api/ai/quiz:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate quiz',
      details: error.toString(),
    });
  }
});

// 3. AI Flashcards Generator Endpoint
app.post('/api/ai/flashcards', async (req: Request, res: Response) => {
  try {
    const { text, count = 10, category } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Please switch to Local On-Device AI mode.',
        code: 'NO_API_KEY',
      });
    }

    const trimmedText = prepareDocumentText(text);

    const prompt = `Generate exactly ${count} high-yield flashcards from the study material below.
${category ? `Category focus: ${category}` : ''}

FLASHCARD PRINCIPLES:
- Front: A clear, concise question, concept prompt, or scenario that tests active recall.
- Back: A complete, accurate explanation or definition with key context.
- Hint: An optional subtle clue to help struggling students.
- Category: The specific sub-field or chapter name.
- Difficulty: 'easy', 'medium', or 'hard'.

Study Material:
${trimmedText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert in active recall and spaced repetition flashcard design.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING, description: 'Question or concept prompt' },
                  back: { type: Type.STRING, description: 'Direct answer and detailed explanation' },
                  hint: { type: Type.STRING, description: 'Helpful memory hook or hint' },
                  category: { type: Type.STRING, description: 'Topic or chapter name' },
                  difficulty: { type: Type.STRING, description: 'easy, medium, or hard' },
                },
                required: ['id', 'front', 'back', 'category', 'difficulty'],
              },
            },
          },
          required: ['flashcards'],
        },
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(jsonText);
    res.json(parsedData.flashcards || []);
  } catch (error: any) {
    console.error('Error in /api/ai/flashcards:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate flashcards',
      details: error.toString(),
    });
  }
});

// 4. AI Exam Mode Generator Endpoint
app.post('/api/ai/exam', async (req: Request, res: Response) => {
  try {
    const { text, title = 'Comprehensive Final Exam', questionCount = 10, timeLimitMinutes = 20 } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Please switch to Local On-Device AI mode.',
        code: 'NO_API_KEY',
      });
    }

    const trimmedText = prepareDocumentText(text);

    const prompt = `Construct a formal, realistic practice examination titled "${title}".
Target Question Count: ${questionCount} questions.
Time limit: ${timeLimitMinutes} minutes.

EXAMINATION REQUIREMENTS:
- Cover the entire breadth of the document fairly.
- Mix difficulties realistically (e.g. 30% easy foundational, 50% medium application, 20% hard analysis).
- Each question must have 4 options and a correctIndex (0-3).
- Provide detailed grading rubrics / explanations for each answer.
- Categorize by topics to allow post-exam performance breakdown.

Document Content:
${trimmedText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an academic examination board director. You produce balanced, standardized exam questions.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            timeLimitMinutes: { type: Type.INTEGER },
            passingScorePercent: { type: Type.INTEGER },
            topicsCovered: { type: Type.ARRAY, items: { type: Type.STRING } },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  points: { type: Type.INTEGER },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation', 'difficulty', 'topic'],
              },
            },
          },
          required: ['title', 'timeLimitMinutes', 'passingScorePercent', 'questions'],
        },
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(jsonText);
    res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/ai/exam:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate exam',
      details: error.toString(),
    });
  }
});

// Vite Middleware or Static Production Serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`StudyMate server running on http://localhost:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
