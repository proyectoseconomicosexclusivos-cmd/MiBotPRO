import { GoogleGenAI, Type, FunctionDeclaration, Tool } from "@google/genai";
import { AppSettings, UserConfiguration } from "../types";

// --- 1. CONFIGURACIÓN E INICIALIZACIÓN ---

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

// --- 2. DEFINICIÓN DE HERRAMIENTAS (TOOLS) ---

const triggerActionWebhookTool: FunctionDeclaration = {
    name: 'trigger_action_webhook',
    description: 'Ejecuta una acción en el sistema externo (Make/n8n) utilizando las credenciales configuradas.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            actionType: { type: Type.STRING, description: 'Tipo de acción (ej: schedule_appointment, check_order, send_message).' },
            payload: { type: Type.OBJECT, description: 'Datos necesarios para la acción.' },
        },
        required: ['actionType', 'payload'],
    }
};

// --- 3. EJECUCIÓN REAL (FETCH) ---

const executeRealWebhook = async (webhookUrl: string, actionType: string, payload: any, integrations: any): Promise<any> => {
    console.log(`[REAL NETWORK CALL] POST to ${webhookUrl}`, { actionType, payload });
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'MiBotPro',
                action: actionType,
                data: payload,
                config: integrations, 
                timestamp: new Date().toISOString()
            })
        });

        const text = await response.text();
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text);
        } catch {
            jsonResponse = { raw: text };
        }

        if (!response.ok) {
            return { status: 'error', code: response.status, message: text };
        }

        return jsonResponse;

    } catch (error) {
        return { 
            status: 'error', 
            message: 'Error de Red. Verifica que tu Webhook de Make/n8n esté activo.', 
            details: error instanceof Error ? error.message : String(error) 
        };
    }
};

// --- 4. CONSTRUCTOR DE PERSONALIDAD Y HERRAMIENTAS ---

const getConfigurationForBot = (config: UserConfiguration): { systemInstruction: string; tools: Tool[] } => {
    
    const customPrompt = config.systemPrompt || '';
    const integrations = config.integrationValues || {};
    
    const webhookUrl = integrations['makeWebhookUrl'] || integrations['n8nWebhookUrl'] || integrations['actionWebhook'];
    const calendarUrl = integrations['bookingPageUrl'];

    let baseIdentity = `
    ROL: Eres el asistente virtual oficial de "${config.businessName}".
    TU CONTEXTO:
    - Horario: ${config.hours}
    - Servicios: ${config.services}
    - Contacto: ${config.phone} / ${config.email}
    
    PERSONALIDAD: Profesional, eficiente, empático y orientado a la solución.
    IDIOMA: Español.
    `;

    if (calendarUrl) {
        baseIdentity += `\nNOTA: Si el usuario quiere reservar y no puedes hacerlo automáticamente, ofrece este link: ${calendarUrl}`;
    }

    let tools: Tool[] = [];
    let instructions = "";

    if (webhookUrl) {
        instructions = `
        TIENES CAPACIDAD DE ACCIÓN REAL.
        Estás conectado a un sistema de automatización en ${webhookUrl}.
        Cuando el usuario quiera realizar una acción (reservar, pedir, enviar mensaje), usa la herramienta 'trigger_action_webhook'.
        `;
        tools = [{ functionDeclarations: [triggerActionWebhookTool] }];
    } else {
        instructions = `
        MODO INFORMATIVO (SIN WEBHOOK).
        No tienes un Webhook de automatización configurado (Make/n8n).
        Si el usuario pide una acción (reservar, enviar SMS), responde educadamente que no estás conectado al sistema central aún,
        y sugiérele al administrador que configure el Webhook en la pestaña 'Integraciones'.
        `;
        tools = [];
    }

    return {
        systemInstruction: `${baseIdentity}\n${instructions}\n${customPrompt}`,
        tools: tools
    };
};

// --- 5. FUNCIÓN PRINCIPAL DE EJECUCIÓN DEL BOT ---

export const getBotResponse = async (
    config: UserConfiguration, 
    prompt: string, 
    history: { role: 'user' | 'model', parts: { text: string }[] }[]
): Promise<{ text?: string, functionCall?: any, toolResult?: any }> => {
    
    // --- SECURITY GATE: CHECK SUBSCRIPTION STATUS ---
    // Esta es la compuerta lógica. Si Stripe ha marcado el bot como 'suspended' (por impago),
    // bloqueamos la ejecución AQUÍ antes de consumir cualquier recurso de API o IA.
    if (config.status === 'suspended') {
        console.warn(`Blocked access to suspended bot: ${config.id}`);
        return { text: "⛔ SERVICIO SUSPENDIDO: Tu suscripción ha caducado o el último pago ha fallado. Por favor, actualiza tu método de pago en el panel de control para reactivar el servicio inmediatamente." };
    }
    
    const apiKey = getApiKey();
    if (!apiKey) {
        return { text: "⚠️ Error Crítico: No has configurado tu API Key de Gemini en Ajustes." };
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const { systemInstruction, tools } = getConfigurationForBot(config);

    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction, tools, temperature: 0.7 },
            history,
        });

        const result = await chat.sendMessage({ message: prompt });
        const response = result.response;
        
        const functionCalls = response.functionCalls;
        
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            const { name, args } = call;

            let backendResponse = { error: 'Unknown tool' };

            if (name === 'trigger_action_webhook') {
                const integrations = config.integrationValues || {};
                const webhookUrl = integrations['makeWebhookUrl'] || integrations['n8nWebhookUrl'] || integrations['actionWebhook'];
                
                if (webhookUrl) {
                    backendResponse = await executeRealWebhook(webhookUrl, args['actionType'], args['payload'], integrations);
                } else {
                    backendResponse = { error: 'Webhook URL not configured.' };
                }
            }

            const resultParts = [{
                functionResponse: {
                    name: name,
                    response: { result: backendResponse } 
                }
            }];
            
            const finalResponse = await chat.sendMessage(resultParts);

            return { 
                functionCall: { name: 'Conexión Externa (API)', args: args['payload'], result: backendResponse },
                text: finalResponse.text 
            };
        }

        return { text: response.text };

    } catch (error) {
        console.error("Error Bot Execution:", error);
        return { text: "Error de conexión con la IA. Por favor intenta más tarde." };
    }
};