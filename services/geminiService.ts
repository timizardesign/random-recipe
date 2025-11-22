import { GoogleGenAI, Type } from "@google/genai";
import { RandomRecipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    strMeal: { type: Type.STRING, description: "Name of the meal" },
    strCategory: { type: Type.STRING, description: "Category of the meal (e.g., Dessert, Beef, Chicken)" },
    strArea: { type: Type.STRING, description: "Origin area of the meal (e.g., Canadian, Italian)" },
    strInstructions: { type: Type.STRING, description: "Comprehensive cooking instructions" },
    strTags: { type: Type.STRING, description: "Comma separated tags (e.g., Sweet, Snack)" },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ingredient: { type: Type.STRING },
          measure: { type: Type.STRING },
        },
        required: ["ingredient", "measure"]
      },
      description: "List of ingredients and their measurements"
    },
    youtubeQuery: { type: Type.STRING, description: "Search query string to find a video of this recipe on YouTube" }
  },
  required: ["strMeal", "strCategory", "strArea", "strInstructions", "ingredients", "youtubeQuery"],
};

export const getRandomMeal = async (): Promise<RandomRecipe> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Generate a random, delicious, and authentic recipe from any cuisine in the world. 
    It should be a real, established dish.
    Provide the details in the specified JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RECIPE_SCHEMA,
        systemInstruction: "You are a culinary API that acts like TheMealDB. Return a single random recipe.",
        temperature: 1.0, // High temperature for randomness
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as RandomRecipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
};

export const generateDishImage = async (recipeTitle: string): Promise<string | null> => {
  const model = "gemini-2.5-flash-image";
  const prompt = `A professional, appetizing food photography shot of ${recipeTitle}. High resolution, centered, culinary magazine style.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) return null;

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
         return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null; 
  }
};

export const getRecipeVideo = async (recipeName: string): Promise<string | null> => {
  const model = "gemini-2.5-flash";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Find a YouTube video tutorial for making ${recipeName}.`,
      config: {
        tools: [{googleSearch: {}}],
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
         // Check for YouTube links in web grounding chunks
         if (chunk.web?.uri && (chunk.web.uri.includes('youtube.com') || chunk.web.uri.includes('youtu.be'))) {
           return chunk.web.uri;
         }
      }
    }
    return null;
  } catch (error) {
    console.error("Error finding video:", error);
    return null;
  }
};