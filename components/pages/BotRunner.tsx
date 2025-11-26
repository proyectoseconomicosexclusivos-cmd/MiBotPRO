import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../../App';
import { BOT_TEMPLATES } from '../../data/bots';
import ChatBotInterface from '../bots/ChatBotInterface';
import ContentGeneratorInterface from '../bots/ContentGeneratorInterface';
import AppointmentBotInterface from '../bots/AppointmentBotInterface';

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

    const renderBotInterface = () => {
        switch (template.id) {
            case '03_reservas_citas':
            case '07_peluqueria_barberia':
            case '08_taller_mecanico':
            case '09_gimnasio_clases':
                return <AppointmentBotInterface config={config} />;

            case '11_creacion_contenido':
            case '12_generacion_imagenes_videos':
            case '13_calendario_editorial':
            case '14_copywriting_ia':
                 return <ContentGeneratorInterface config={config} />;

            // Default to chat interface for most other bots
            default:
                return <ChatBotInterface config={config} />;
        }
    };

    return (
        <div>
            <div className="pb-6 border-b border-gray-200 mb-6 flex justify-between items-center">
                <div>
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 bg-primary-50 rounded-lg p-2">
                           {template.icon}
                        </div>
                        <div>
                             <h1 className="text-2xl font-bold text-gray-900">{template.title}</h1>
                             <p className="text-md text-gray-500">para <span className="font-semibold">{config.businessName}</span></p>
                        </div>
                    </div>
                </div>
                <Link to="/dashboard" className="text-sm font-medium text-primary-600 hover:text-primary-800">
                    &larr; Volver al Panel
                </Link>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                {renderBotInterface()}
            </div>
        </div>
    );
};

export default BotRunner;