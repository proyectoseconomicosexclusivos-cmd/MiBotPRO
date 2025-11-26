import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../../App';
import { BOT_TEMPLATES } from '../../data/bots';
import ContentGeneratorInterface from '../bots/ContentGeneratorInterface';
import UniversalChatInterface from '../bots/AppointmentBotInterface'; 
import Button from '../ui/Button';

const BotRunner: React.FC = () => {
    const { configId } = useParams<{ configId: string }>();
    const appContext = useContext(AppContext);
    
    const config = appContext?.userConfigurations.find(c => c.id === configId);
    const template = config ? BOT_TEMPLATES.find(t => t.id === config.templateId) : null;

    if (!config || !template) {
        return (
            <div className="text-center p-12">
                <h2 className="text-2xl font-bold text-gray-800">Bot no encontrado</h2>
                <p className="mt-2 text-gray-600">No se pudo encontrar la configuración para este bot.</p>
                <Link to="/dashboard" className="mt-4 inline-block text-primary-600 hover:underline">
                    Volver al Panel
                </Link>
            </div>
        );
    }

    // --- SECURITY BLOCK: SUSPENDED OR PENDING ---
    if (config.status === 'suspended' || config.status === 'pending_payment') {
        const isSuspended = config.status === 'suspended';
        return (
            <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 text-center">
                <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 ${isSuspended ? 'bg-red-100' : 'bg-yellow-100'}`}>
                    {isSuspended ? (
                         <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    ) : (
                        <svg className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    )}
                </div>
                
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
                    {isSuspended ? 'Servicio Suspendido' : 'Activación Pendiente'}
                </h2>
                
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    {isSuspended 
                        ? 'Lamentablemente, no hemos podido procesar la renovación de tu suscripción. El bot ha dejado de operar temporalmente para evitar cortes en el servicio.'
                        : 'Este bot está configurado pero aún no ha sido activado. Completa el proceso de suscripción para empezar a usarlo.'
                    }
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                     <Link to="/dashboard">
                        <Button variant="secondary" className="w-full sm:w-auto">
                            Volver al Panel
                        </Button>
                    </Link>
                    {/* In a real app, this button would trigger the Stripe Update Payment Method flow directly */}
                    <a href={appContext?.settings.stripePaymentLink} target="_blank" rel="noreferrer" className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 w-full sm:w-auto">
                        {isSuspended ? 'Actualizar Método de Pago' : 'Activar Ahora'}
                    </a>
                </div>
                
                <p className="mt-6 text-xs text-gray-400">
                    Si crees que esto es un error, contacta con soporte. ID de Referencia: <span className="font-mono">{config.id}</span>
                </p>
            </div>
        );
    }

    const renderBotInterface = () => {
        const generativeBots = [
            '11_creacion_contenido',
            '12_generacion_imagenes_videos',
            '13_calendario_editorial',
            '14_copywriting_ia',
            '15_analisis_redes',
            '17_informes_analitica'
        ];

        if (generativeBots.includes(template.id)) {
             return <ContentGeneratorInterface config={config} />;
        }
        return <UniversalChatInterface config={config} />;
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="pb-6 border-b border-gray-200 mb-6 flex justify-between items-center">
                <div>
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 bg-primary-50 rounded-lg p-2">
                           {template.icon}
                        </div>
                        <div>
                             <h1 className="text-2xl font-bold text-gray-900">{template.title}</h1>
                             <p className="text-md text-gray-500">Operando para <span className="font-semibold">{config.businessName}</span></p>
                        </div>
                    </div>
                </div>
                <Link to="/dashboard" className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Volver
                </Link>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
                {renderBotInterface()}
            </div>
        </div>
    );
};

export default BotRunner;