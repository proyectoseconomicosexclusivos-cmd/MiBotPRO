

import { GoogleGenAI, Type } from "@google/genai";

// Fix: Cast `import.meta` to `any` to resolve TypeScript error about missing `env` property.
// This is necessary when Vite's type definitions are not automatically available.
const geminiApiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

if (!geminiApiKey) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey! });

const suggestionSchema = {
  type: Type.OBJECT,
  properties: {
    businessName: {
      type: Type.STRING,
      description: "Un nombre corto y profesional para el negocio.",
    },
    email: {
      type: Type.STRING,
      description: "Un email de contacto profesional, por ejemplo, 'contacto@nombredelnegocio.com'.",
    },
    hours: {
      type: Type.STRING,
      description: "Un horario de atención típico para este tipo de negocio, en formato 'L-V 9:00-18:00, S 10:00-14:00'.",
    },
    services: {
      type: Type.STRING,
      description: "Una lista de 3-5 servicios clave ofrecidos por el negocio, separados por comas.",
    },
  },
  required: ["businessName", "email", "hours", "services"],
};

export const getBusinessSuggestions = async (businessDescription: string): Promise<{ businessName: string; email: string; hours: string; services: string; } | null> => {
  if (!geminiApiKey) {
    console.error("Gemini API key is not configured. Please ensure VITE_GEMINI_API_KEY is available.");
    alert("El asistente IA no está configurado. Por favor, contacta al administrador.");
    return null;
  }
  
  try {
    const prompt = `
      Eres un asistente experto en configuración de negocios. Basado en la siguiente descripción, genera sugerencias para completar un perfil de negocio.
      Descripción: "${businessDescription}"
      
      Proporciona un nombre de negocio, un email de contacto, un horario de atención y una lista de servicios clave.
      Responde únicamente con el objeto JSON estructurado.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionSchema,
      },
    });

    const jsonString = response.text.trim();
    const suggestions = JSON.parse(jsonString);
    return suggestions;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    alert("Hubo un error al contactar al asistente de IA. Por favor, intenta de nuevo.");
    return null;
  }
};