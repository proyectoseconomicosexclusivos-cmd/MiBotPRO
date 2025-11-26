import React, { useState } from 'react';
import { UserConfiguration } from '../../types';
import { getBotResponse } from '../../services/botRunnerService';
import Button from '../ui/Button';

interface ContentGeneratorInterfaceProps {
    config: UserConfiguration;
}

const ContentGeneratorInterface: React.FC<ContentGeneratorInterfaceProps> = ({ config }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (prompt.trim() === '' || isLoading) return;

        setIsLoading(true);
        setGeneratedContent('');
        const response = await getBotResponse(config, prompt, []);
        setGeneratedContent(response.text || 'No se pudo generar el contenido.');
        setIsLoading(false);
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                    Tu Petición
                </label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Ej: "Genera 3 ideas para un post de Instagram sobre nuestro nuevo servicio de detailing cerámico." para ${config.businessName}`}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    rows={4}
                    disabled={isLoading}
                />
            </div>
            <Button onClick={handleGenerate} isLoading={isLoading}>
                {isLoading ? 'Generando...' : 'Generar Contenido'}
            </Button>

            {generatedContent && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Contenido Generado</h3>
                    <div className="p-4 bg-gray-50 border rounded-md whitespace-pre-wrap font-mono text-sm">
                        {generatedContent}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentGeneratorInterface;