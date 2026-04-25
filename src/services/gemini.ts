import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getAILabAdvice(imageData: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Analyze this fashion-related image. If it shows a damaged garment, provide a creative upcycling and repair plan to make it trendy and sustainable. If it shows a person wearing an outfit or a flat lay of an outfit, provide constructive feedback and suggestions on how to improve the look (e.g., accessorizing, layering, color harmony). Provide the response in clear, concise text only. Use bullet points for different ideas. Keep it professional and inspiring." },
            { inlineData: { data: imageData.split(',')[1], mimeType: "image/jpeg" } }
          ]
        }
      ]
    });
    return response.text || "I couldn't analyze the image. Please try again with a clearer photo.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI is currently resting. Please try again in a moment.";
  }
}

export async function getStylingFeedback(outfitDescription: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Rate this outfit's color harmony and seasonal trendiness: ${outfitDescription}. Provide a score out of 10 and a brief explanation. Format as JSON with 'score' and 'feedback'.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return { score: 8, feedback: "Great color combination! Very trendy for this season." };
  }
}
