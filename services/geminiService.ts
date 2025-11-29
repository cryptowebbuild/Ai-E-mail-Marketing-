import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CampaignData, ImageSize } from "../types";

// Helper to get the AI instance. 
// IMPORTANT: We recreate this on every call to ensure we pick up the latest API key 
// if the user has selected one via window.aistudio.
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateCampaignText = async (
  topic: string,
  audience: string,
  tone: string
): Promise<CampaignData> => {
  const ai = getAI();
  
  const prompt = `
    Create an email marketing campaign for: ${topic}.
    Target Audience: ${audience}.
    Tone: ${tone}.
    
    I need:
    1. 3 catchy subject lines.
    2. The main body copy for the email (formatted with Markdown).
    3. A detailed visual description (image prompt) that represents the campaign theme, suitable for an AI image generator.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      subjectLines: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Three catchy email subject lines."
      },
      bodyCopy: {
        type: Type.STRING,
        description: "The main email body content in Markdown format."
      },
      imagePrompt: {
        type: Type.STRING,
        description: "A detailed prompt to generate a marketing image for this email."
      }
    },
    required: ["subjectLines", "bodyCopy", "imagePrompt"],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      systemInstruction: "You are a world-class marketing copywriter. Your goal is to drive conversions.",
      thinkingConfig: { thinkingBudget: 1024 } // Use a bit of thinking for better copy structure
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  return JSON.parse(text) as CampaignData;
};

export const generateCampaignImage = async (
  prompt: string,
  size: ImageSize
): Promise<string> => {
  const ai = getAI();

  // "Nano Banana Pro" corresponds to gemini-3-pro-image-preview
  // It supports 1K, 2K, 4K image sizes.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: "4:3", // Standard marketing visual ratio
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from Gemini");
};

export const createChatSession = () => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a helpful and creative marketing assistant. You help users refine their marketing strategies, brainstorm ideas, and troubleshoot campaign issues.",
    }
  });
};
