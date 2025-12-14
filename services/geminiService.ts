import { GoogleGenAI, Type } from "@google/genai";
import { HandData } from "../types";

let ai: GoogleGenAI | null = null;
let model: any = null;

export const initGemini = (apiKey: string) => {
  ai = new GoogleGenAI({ apiKey });
  // Using gemini-2.5-flash for speed/latency balance
  model = ai.models; 
};

export const analyzeFrame = async (base64Image: string): Promise<HandData | null> => {
  if (!ai || !model) return null;

  try {
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Analyze the hand in this image. 1. If palm is open/fingers spread, status is 'CHAOS'. 2. If fist/closed/no hand, status is 'FORMED'. 3. Detect hand center position X and Y (0 to 1). Return JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ['CHAOS', 'FORMED'] },
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const data = JSON.parse(text);
    return {
      state: data.status as 'CHAOS' | 'FORMED',
      x: data.x || 0.5,
      y: data.y || 0.5
    };
  } catch (e) {
    console.error("Gemini Vision Error:", e);
    return null;
  }
};
