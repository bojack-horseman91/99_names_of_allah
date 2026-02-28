import { GoogleGenAI } from "@google/genai";
import { NameOfAllah } from "../data/names";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface DeepDiveContent {
  meaning: string;
  significance: string;
  reflection: string;
}

export async function generateDeepDive(name: NameOfAllah): Promise<DeepDiveContent | null> {
  try {
    const prompt = `
      Provide a detailed spiritual explanation for the Name of Allah: "${name.arabic}" (${name.transliteration}).
      
      Return the response in JSON format with the following keys:
      - meaning: A detailed linguistic and theological explanation of the name.
      - significance: Its significance in Islamic tradition and theology.
      - reflection: A practical example of how a believer can reflect this attribute in their daily life or personal spiritual practice.
      
      Keep the tone respectful, spiritual, and educational.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as DeepDiveContent;
  } catch (error) {
    console.error("Error generating deep dive content:", error);
    return null;
  }
}
