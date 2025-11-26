

import { GoogleGenAI, Chat } from "@google/genai";

// Fix: Cast `import.meta` to `any` to resolve TypeScript error about missing `env` property.
// This is necessary when Vite's type definitions are not automatically available.
const geminiApiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

if (!geminiApiKey) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set. AI Chat will not work.");
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey! });

// We use a single chat instance to maintain conversation history.
let chat: Chat | null = null;

const initializeChat = () => {
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'Eres un amigable y útil asistente de soporte para MiBotPro, una plataforma para crear y configurar bots de IA para negocios. Tu objetivo es ayudar a los usuarios a entender qué hacen los diferentes bots, cómo funciona el proceso de configuración y pago, y responder preguntas generales sobre la plataforma. Sé conciso, amable y profesional. No inventes funcionalidades que no existen.',
    },
  });
};

export const sendMessageToAI = async (message: string): Promise<string> => {
  if (!geminiApiKey) {
    return "Lo siento, el servicio de IA no está configurado en este momento. Por favor, asegúrate de que la clave API de Gemini esté configurada.";
  }
  
  // Initialize chat on the first message
  if (!chat) {
    initializeChat();
  }
  
  try {
    const response = await chat!.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini AI:", error);
    // If the chat fails, we can try re-initializing it for the next message.
    chat = null;
    return "Lo siento, ha ocurrido un error al contactar con el asistente. Por favor, inténtalo de nuevo más tarde.";
  }
};