import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings } from "../types";

const getApiKey = (): string | null => {
    try {
        const savedSettings = localStorage.getItem('mibotpro_appSettings');
        if (savedSettings) {
            const settings: AppSettings = JSON.parse(savedSettings);
            return settings.geminiApiKey;
        }
        return null;
    } catch {
        return null;
    }
}

const suggestionSchema = {
  type: Type.OBJECT,
  properties: {
    businessName: { type: Type.STRING, description: "Un nombre corto y profesional para el negocio." },
    email: { type: Type.STRING, description: "Un email de contacto profesional." },
    hours: { type: Type.STRING, description: "Un horario de atención típico para este tipo de negocio." },
    services: { type: Type.STRING, description: "Una lista de 3-5 servicios clave ofrecidos, separados por comas." },
  },
  required: ["businessName", "email", "hours", "services"],
};

export const getBusinessSuggestions = async (businessDescription: string): Promise<{ businessName: string; email: string; hours: string; services: string; } | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    alert("La clave API de Gemini no está configurada. Por favor, añádela en la página de Ajustes.");
    return null;
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const prompt = `Basado en la siguiente descripción, genera sugerencias para un perfil de negocio: "${businessDescription}". Responde únicamente con el objeto JSON estructurado.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionSchema,
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    alert("Hubo un error al contactar al asistente de IA. Revisa la consola para más detalles.");
    return null;
  }
};