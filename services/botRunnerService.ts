import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { AppSettings, UserConfiguration } from "../types";

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
};

const bookAppointmentFunction: FunctionDeclaration = {
    name: 'book_appointment',
    description: 'Agenda una cita para un cliente con un servicio, fecha y hora específicos.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            service: { type: Type.STRING, description: 'El servicio que el cliente quiere reservar. Debe ser uno de los servicios ofrecidos.' },
            date: { type: Type.STRING, description: 'La fecha de la cita, por ejemplo "mañana" o "25 de diciembre".' },
            time: { type: Type.STRING, description: 'La hora de la cita, por ejemplo "3 PM" o "15:00".' },
        },
        required: ['service', 'date', 'time'],
    }
};

const getSystemInstructionAndTools = (config: UserConfiguration): { systemInstruction: string; tools?: any } => {
    const baseInfo = `Eres un asistente de IA para ${config.businessName}. Tu horario es ${config.hours}. Los servicios que ofreces son: ${config.services}. Sé amable, profesional y directo.`;

    switch (config.templateId) {
        // --- Atención al Cliente ---
        case '01_atencion_telefonica':
        case '02_whatsapp_atencion':
        case '20_multicanal_internacional':
            return { systemInstruction: `${baseInfo} Tu tarea es responder a las preguntas de los clientes y ayudarles a través del chat.` };

        // --- Gestión y Reservas ---
        case '03_reservas_citas':
        case '07_peluqueria_barberia':
        case '08_taller_mecanico':
        case '09_gimnasio_clases':
            return {
                systemInstruction: `${baseInfo} Tu objetivo principal es ayudar a los usuarios a reservar citas para los servicios ofrecidos. Pide la información necesaria (servicio, fecha, hora) y luego utiliza la herramienta 'book_appointment'.`,
                tools: [{ functionDeclarations: [bookAppointmentFunction] }]
            };
        
        // --- E-commerce y Finanzas (Simulado) ---
        case '04_seguimiento_pedidos':
            return { systemInstruction: `${baseInfo} Simula ser un bot de seguimiento de pedidos. Si un usuario pregunta por su pedido, invéntate un número de pedido y un estado (ej: 'enviado', 'en reparto').` };
        case '05_cobros_recordatorios':
            return { systemInstruction: `${baseInfo} Simula ser un bot de cobros. Si un usuario quiere pagar una factura, infórmale de que se le ha enviado un enlace de pago simulado a su email.` };

        // --- Marketing y Contenido ---
        case '11_creacion_contenido':
            return { systemInstruction: `Eres un asistente de IA experto en marketing de contenidos para ${config.businessName}. Genera ideas y borradores para blogs y redes sociales basados en las peticiones del usuario y los servicios: ${config.services}.` };
        case '14_copywriting_ia':
            return { systemInstruction: `Eres un copywriter de IA para ${config.businessName}. Escribe textos persuasivos para anuncios y páginas de venta, optimizados para la conversión, basados en los servicios: ${config.services}.` };
        
        // --- RRHH (Simulado) ---
        case '16_asistente_virtual_interno':
        case '18_formacion_onboarding':
            return { systemInstruction: `Eres un asistente de RRHH para ${config.businessName}. Responde preguntas frecuentes de los empleados sobre la empresa, sus servicios (${config.services}) y políticas internas. Puedes inventar políticas si es necesario para la simulación.` };

        default:
            return { systemInstruction: baseInfo };
    }
};


export const getBotResponse = async (config: UserConfiguration, prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return { text: "Error: La clave API de Gemini no está configurada en Ajustes." };
    }
    const ai = new GoogleGenAI({ apiKey });

    const { systemInstruction, tools } = getSystemInstructionAndTools(config);

    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
                tools
            },
            history,
        });

        const response = await chat.sendMessage({ message: prompt });
        
        if (response.functionCalls && response.functionCalls.length > 0) {
            return { functionCall: response.functionCalls[0] };
        }
        
        return { text: response.text };

    } catch (error) {
        console.error("Error calling Gemini API for bot response:", error);
        return { text: "Lo siento, ha ocurrido un error al contactar con la IA." };
    }
};