import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing");
    return "AI Description unavailable (Missing API Key).";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a concise, attractive sales description for an IT product.
      Product Name: ${productName}
      Category: ${category}
      Language: Thai
      Max length: 2 sentences.`,
    });
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate description.";
  }
};
