import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

if (process.env.API_KEY) {
  genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const askFarmAssistant = async (prompt: string, context?: string): Promise<string> => {
  if (!genAI) {
    return "AI service is not configured (Missing API Key).";
  }

  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an expert sheep farming consultant for 'Ali Farm'. 
    You provide advice on sheep health, investment ROI, and feed management.
    Keep answers concise, professional, and practical.
    If context is provided, use it to answer the question.`;

    const fullPrompt = context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt;

    const response = await genAI.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};