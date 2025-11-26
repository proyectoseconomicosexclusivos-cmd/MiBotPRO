import { GoogleGenAI, Chat } from "@google/genai";
import { AppSettings } from "../types";

let chat: Chat | null = null;
let lastUsedApiKey: string | null = null;

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


const initializeChat = (apiKey: string) => {
  const ai = new GoogleGenAI({ apiKey });
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'Eres un amigable y útil asistente de soporte para MiBotPro. Tu objetivo es ayudar a los usuarios a entender la plataforma. Sé conciso y amable.',
    },
  });
  lastUsedApiKey = apiKey;
};

export const sendMessageToAI = async (message: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return "La clave API de Gemini no está configurada. Por favor, añádela en la página de Ajustes para usar el chat de IA.";
  }
  
  if (!chat || lastUsedApiKey !== apiKey) {
    initializeChat(apiKey);
  }
  
  try {
    const response = await chat!.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini AI:", error);
    chat = null; // Reset chat on error
    return "Lo siento, ha ocurrido un error al contactar con el asistente. Por favor, inténtalo de nuevo.";
  }
};