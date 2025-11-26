import { UserConfiguration, AppSettings, User } from '../types';

export const sendConfigurationToWebhook = async (
    config: UserConfiguration,
    settings: AppSettings,
    user: User,
): Promise<{ success: boolean; message: string }> => {
    
    if (!settings.n8nWebhookUrl) {
        return { success: false, message: "La URL del webhook de n8n no está configurada en Ajustes." };
    }

    const payload = {
        config_id: config.id,
        user_id: user.id,
        user_email: user.email,
        template_id: config.templateId,
        business_name: config.businessName,
        phone: config.phone,
        email: config.email,
        hours: config.hours,
        services: config.services,
    };

    try {
        // 'no-cors' mode is a "fire-and-forget" request from the browser.
        // We can't read the response, so we assume success if fetch doesn't throw.
        await fetch(settings.n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            mode: 'no-cors' 
        });

        return { success: true, message: "La configuración se ha enviado al webhook." };

    } catch (error) {
        console.error("Error sending to n8n webhook:", error);
        return { success: false, message: `Error al contactar con el webhook. Asegúrate de que la URL es correcta y tu webhook está activo.` };
    }
};