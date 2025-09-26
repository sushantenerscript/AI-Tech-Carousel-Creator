import { GoogleGenAI, Type } from "@google/genai";
import { SlideContent } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const slideSchema = {
  type: Type.OBJECT,
  properties: {
    slideNumber: {
      type: Type.INTEGER,
      description: 'The sequential number of the slide, starting from 1.',
    },
    title: {
      type: Type.STRING,
      description: 'A short, punchy title for the slide (max 10 words). Use emojis where appropriate. This is the main heading.',
    },
    content: {
      type: Type.STRING,
      description: 'The main content for the slide. Keep it concise, using bullet points or short paragraphs (max 50 words). Break down the concept into a simple, digestible piece of information.',
    },
  },
  required: ['slideNumber', 'title', 'content'],
};

const carouselSchema = {
  type: Type.ARRAY,
  items: slideSchema,
  description: 'An array of 5 to 7 slides for a social media carousel post.'
};

export const generateCarouselText = async (topic: string): Promise<SlideContent[]> => {
  const model = 'gemini-2.5-flash';
  
  const prompt = `Create a 7-slide social media carousel post about the topic: "${topic}". 
  - The first slide should be a catchy title to hook the reader.
  - The next 5 slides should break down the topic with key information.
  - The last slide should be a concluding summary or a call-to-action.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert content creator specializing in breaking down complex technical topics into engaging, easy-to-understand social media carousel posts. Your tone is informative, clear, and slightly informal. Use emojis to enhance engagement.",
        responseMimeType: "application/json",
        responseSchema: carouselSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const slides: SlideContent[] = JSON.parse(jsonText);
    
    if (!Array.isArray(slides) || slides.length === 0) {
        throw new Error("API returned an invalid format.");
    }

    return slides;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error("Failed to generate carousel content.");
  }
};
