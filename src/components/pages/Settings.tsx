import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { AppSettings } from '../../types';
import Button from '../ui/Button';

const Settings: React.FC = () => {
    const appContext = useContext(AppContext);
    const [settings, setSettings] = useState<AppSettings>({
        n8nWebhookUrl: '',
        geminiApiKey: '',
        stripePaymentLink: '',
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
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">Ajustes del Entorno</h1>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-200 uppercase tracking-wide">
                        Producción
                    </span>
                </div>
                <p className="mt-2 text-lg text-gray-500">
                    Configura las credenciales maestras. Estos datos permiten que la aplicación funcione realmente conectándose a servicios externos.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8 bg-white p-8 rounded-lg shadow-md border-t-4 border-primary-600">
                
                <div className="space-y-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Gemini API Key (Cerebro IA)</h3>
                            <p className="text-xs text-gray-500">Requerido para el funcionamiento de todos los bots.</p>
                        </div>
                    </div>
                    <div>
                        <input 
                            type="password" 
                            name="geminiApiKey" 
                            value={settings.geminiApiKey || ''} 
                            onChange={handleChange} 
                            className={inputClass} 
                            placeholder="AIzaSy..." 
                            required
                        />
                         <p className="mt-2 text-xs text-gray-500">
                            Obtenla gratis aquí: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">Google AI Studio</a>
                        </p>
                    </div>
                </div>

                <div className="space-y-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                     <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                         <div>
                            <h3 className="text-lg font-bold text-gray-800">Stripe Payment Link (Suscripciones)</h3>
                            <p className="text-xs text-gray-500">El enlace creado en Stripe para cobrar la suscripción mensual.</p>
                        </div>
                    </div>
                    <div>
                        <input 
                            type="url" 
                            name="stripePaymentLink" 
                            value={settings.stripePaymentLink || ''} 
                            onChange={handleChange} 
                            className={inputClass} 
                            placeholder="https://buy.stripe.com/..." 
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Crea un enlace de pago en <a href="https://dashboard.stripe.com/payment-links" target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">Stripe Dashboard</a>. Asegúrate de configurar la redirección post-pago a: <code className="bg-gray-100 px-1 rounded">https://tudominio.com/#/dashboard?success=true</code>
                        </p>
                    </div>
                </div>

                <div className="space-y-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                     <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                         <div>
                            <h3 className="text-lg font-bold text-gray-800">Webhook Maestro de Activación</h3>
                            <p className="text-xs text-gray-500">Endpoint real (n8n/Make) que recibe la orden de despliegue tras el pago.</p>
                        </div>
                    </div>
                    <div>
                        <input 
                            type="url" 
                            name="n8nWebhookUrl" 
                            value={settings.n8nWebhookUrl || ''} 
                            onChange={handleChange} 
                            className={inputClass} 
                            placeholder="https://su-instancia.n8n.cloud/webhook/activar-bot" 
                        />
                    </div>
                </div>

                <div className="flex justify-end items-center space-x-4 pt-6 border-t">
                    {isSaved && (
                        <div className="flex items-center text-green-600 text-sm font-medium animate-pulse">
                            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Guardado y Activo
                        </div>
                    )}
                    <Button type="submit" className="px-6 py-2.5 text-base shadow-lg shadow-primary-500/30">Guardar Cambios</Button>
                </div>
            </form>
        </div>
    );
};

export default Settings;