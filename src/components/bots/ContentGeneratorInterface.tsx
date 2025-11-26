import React, { useState } from 'react';
import { UserConfiguration } from '../../types';
import { getBotResponse } from '../../services/botRunnerService';
import Button from '../ui/Button';

interface ContentGeneratorInterfaceProps {
    config: UserConfiguration;
}

const TONES = ['Profesional', 'Amigable', 'Divertido', 'Urgente', 'Inspirador', 'Técnico'];
const FORMATS = ['Post de Instagram', 'Hilo de Twitter/X', 'Artículo de Blog', 'Email de Ventas', 'Post de LinkedIn', 'Guion de TikTok'];

const ContentGeneratorInterface: React.FC<ContentGeneratorInterfaceProps> = ({ config }) => {
    const [topic, setTopic] = useState('');
    const [selectedTone, setSelectedTone] = useState(TONES[0]);
    const [selectedFormat, setSelectedFormat] = useState(FORMATS[0]);
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (topic.trim() === '' || isLoading) return;

        setIsLoading(true);
        setGeneratedContent('');

        // Construimos un prompt profesional con ingeniería de prompts
        const engineeredPrompt = `
            ACTÚA COMO: Un experto en Copywriting y Marketing Digital para el negocio "${config.businessName}".
            CONTEXTO DEL NEGOCIO: Servicios: ${config.services}.
            
            TAREA: Generar contenido de alta calidad.
            TEMA: ${topic}
            FORMATO: ${selectedFormat}
            TONO DE VOZ: ${selectedTone}
            
            REGLAS:
            1. Usa emojis si el formato lo requiere (ej: Instagram).
            2. Incluye hashtags relevantes al final.
            3. Estructura el texto para maximizar la retención (ganchos visuales, párrafos cortos).
            4. Incluye una Llamada a la Acción (CTA) clara basada en los servicios del negocio.
        `;

        const response = await getBotResponse(config, engineeredPrompt, []);
        setGeneratedContent(response.text || 'No se pudo generar el contenido. Verifica tu API Key.');
        setIsLoading(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContent);
        alert('¡Contenido copiado al portapapeles!');
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full min-h-[60vh]">
            {/* Left Panel: Controls */}
            <div className="w-full md:w-1/3 space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Tema o Idea Principal
                    </label>
                    <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={`Ej: Promoción de verano para ${config.businessName}...`}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        rows={4}
                        disabled={isLoading}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Formato</label>
                        <select 
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                        >
                            {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tono de Voz</label>
                        <select 
                            value={selectedTone}
                            onChange={(e) => setSelectedTone(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                        >
                            {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <Button onClick={handleGenerate} isLoading={isLoading} fullWidth className="py-3 shadow-lg shadow-primary-500/20">
                    {isLoading ? 'Generando...' : 'Crear Contenido ✨'}
                </Button>
            </div>

            {/* Right Panel: Result */}
            <div className="w-full md:w-2/3 bg-gray-50 rounded-xl border border-gray-200 p-6 relative flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Resultado Generado</h3>
                    {generatedContent && (
                        <button onClick={copyToClipboard} className="text-xs flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Copiar
                        </button>
                    )}
                </div>
                
                <div className="flex-grow bg-white rounded-lg border border-gray-200 p-4 shadow-sm overflow-y-auto min-h-[300px]">
                    {generatedContent ? (
                        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800">
                            {generatedContent}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                            <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            <p className="text-sm">El contenido generado aparecerá aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentGeneratorInterface;