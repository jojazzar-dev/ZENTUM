
import { GoogleGenAI } from "@google/genai";

// Market Analysis service using Gemini API
export const getMarketAnalysis = async (symbol: string, type: 'FOREX' | 'CRYPTO') => {
  try {
    // Initializing with the environment API key directly as per SDK requirements
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the current trading sentiment for ${symbol} in the ${type} market. Provide a short 3-sentence expert prediction on whether it's a good time to Buy or Sell, based on technical indicators like RSI and moving averages (hypothetically).`,
    });
    // Extracting generated text directly from response.text property
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Market analysis temporarily unavailable. Please monitor technical indicators closely.";
  }
};
