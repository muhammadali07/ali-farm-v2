
import { GoogleGenAI } from "@google/genai";

// Fix: Always use process.env.API_KEY directly and follow recommended initialization inside the service function
export const askFarmAssistant = async (prompt: string, context?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const model = 'gemini-3-flash-preview';
    const systemInstruction = `You are an expert sheep farming consultant for 'Ali Farm'. 
    You provide advice on sheep health, investment ROI, and feed management.
    Keep answers concise, professional, and practical.
    If context is provided, use it to answer the question.`;

    const fullPrompt = context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt;

    // Fix: Using correct object parameter style and string content as per guidelines
    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    // Fix: Accessing text property directly (it's a getter, not a method)
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};
