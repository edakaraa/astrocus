import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const inputSchema = z.object({
  language: z.enum(["tr", "en"]),
  durationMinutes: z.number().int().min(1).max(180),
  categoryId: z.string().min(1).max(64),
  currentStreak: z.number().int().min(0),
  todayTotalMinutes: z.number().int().min(0),
  totalStardust: z.number().int().min(0),
});

export type GalacticAdviceInput = z.infer<typeof inputSchema>;

export const parseGalacticAdviceInput = (body: unknown): GalacticAdviceInput =>
  inputSchema.parse(body);

export const getGalacticAdvice = async (input: GalacticAdviceInput): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const langLabel = input.language === "tr" ? "Turkish" : "English";
  const prompt = `You are Astrocus, a calm cosmic focus coach in a gamified productivity app.
Write ONE short personalized sentence (max 28 words) in ${langLabel}.
Tone: warm, galactic metaphor, no emojis, no bullet points.
User data:
- Focus session just completed: ${input.durationMinutes} minutes
- Category: ${input.categoryId}
- Current streak: ${input.currentStreak} days
- Focus time today: ${input.todayTotalMinutes} minutes
- Total stardust: ${input.totalStardust}
Give a "Galactic Tip" that motivates without being cheesy.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  if (!text) {
    throw new Error("Empty Gemini response");
  }
  return text.replace(/^["']|["']$/g, "");
};
