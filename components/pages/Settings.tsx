import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { AppSettings } from '../../types';
import Button from '../ui/Button';

const Settings: React.FC = () => {
    const appContext = useContext(AppContext);
    const [settings, setSettings] = useState<AppSettings>({
        n8nWebhookUrl: '',
        geminiApiKey: '',
    });
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (appContext?.settings) {
            setSettings(appContext.settings);
        }
    }, [appContext?.settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        appContext?.updateSettings(settings);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-mono";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <div>
            <div className="pb-8 border-b border-gray-200 mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Ajustes de Integración</h1>
                <p className="mt-2 text-lg text-gray-500">
                    Configura las claves API para activar las funciones de IA y las simulaciones.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8 bg-white p-8 rounded-lg shadow-md">
                
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">n8n (Simulación)</h3>
                    <div>
                        <label htmlFor="n8nWebhookUrl" className={labelClass}>Webhook URL</label>
                        <input type="text" name="n8nWebhookUrl" value={settings.n8nWebhookUrl} onChange={handleChange} className={inputClass} placeholder="https://tudominio.n8n.cloud/..." />
                         <p className="mt-2 text-xs text-gray-500">Esta URL se usará para la simulación de activación de bots.</p>
                    </div>
                </div>

                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">Google Gemini</h3>
                    <div>
                        <label htmlFor="geminiApiKey" className={labelClass}>API Key</label>
                        <input type="password" name="geminiApiKey" value={settings.geminiApiKey} onChange={handleChange} className={inputClass} placeholder="AIzaSy..." />
                        <p className="mt-2 text-xs text-gray-500">Tu clave API es necesaria para el Asistente de Configuración y el Chat de Soporte.</p>
                    </div>
                </div>
                
                <div className="flex justify-end items-center space-x-4 pt-4 border-t">
                    {isSaved && <span className="text-green-600 text-sm font-medium transition-opacity">¡Guardado con éxito!</span>}
                    <Button type="submit">Guardar Cambios</Button>
                </div>
            </form>
        </div>
    );
};

export default Settings;