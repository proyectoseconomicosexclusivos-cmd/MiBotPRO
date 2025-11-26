import React, { useState, useCallback, useEffect, useContext } from 'react';
import { BotTemplate, UserConfiguration } from '../../types';
import Button from './Button';
import { getBusinessSuggestions, generateBotSystemPrompt, generateAutomationBlueprint } from '../../services/geminiService';
import { AppContext } from '../../App';

type FormData = Omit<UserConfiguration, 'id' | 'createdAt' | 'status' | 'templateId' | 'templateTitle' | 'userId'>;

interface ConfigurationModalProps {
  bot: BotTemplate;
  onClose: () => void;
  onSave: (config: any) => void;
  existingConfig?: UserConfiguration;
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({ bot, onClose, onSave, existingConfig }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations' | 'blueprint'>('profile');
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    phone: '',
    email: '',
    hours: '',
    services: '',
    systemPrompt: '',
    integrationValues: {},
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  
  // Blueprint States
  const [selectedPlatform, setSelectedPlatform] = useState<'n8n' | 'make'>('n8n');
  const [blueprintCode, setBlueprintCode] = useState('');
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);

  const appContext = useContext(AppContext);

  useEffect(() => {
    if (existingConfig) {
      setFormData({
        businessName: existingConfig.businessName,
        phone: existingConfig.phone,
        email: existingConfig.email,
        hours: existingConfig.hours,
        services: existingConfig.services,
        systemPrompt: existingConfig.systemPrompt || '',
        integrationValues: existingConfig.integrationValues || {},
      });
      if (existingConfig.systemPrompt) {
          setShowAdvanced(true);
      }
    }
  }, [existingConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIntegrationChange = (key: string, value: string) => {
    setFormData(prev => ({
        ...prev,
        integrationValues: {
            ...prev.integrationValues,
            [key]: value
        }
    }));
  };

  const handleGenerateWithAI = useCallback(async () => {
    if (!aiDescription) return;
    setIsGenerating(true);
    
    const suggestions = await getBusinessSuggestions(aiDescription);
    
    if (suggestions) {
      const updatedData = { ...formData, ...suggestions };
      setFormData(prev => ({ ...prev, ...suggestions }));

      const generatedPrompt = await generateBotSystemPrompt(bot.title, updatedData);
      
      if (generatedPrompt) {
          setFormData(prev => ({ ...prev, systemPrompt: generatedPrompt }));
          setShowAdvanced(true); 
      }
    }
    
    setIsGenerating(false);
  }, [aiDescription, bot.title, formData]);

  const handleGenerateBlueprint = async () => {
      setIsGeneratingBlueprint(true);
      // We pass the current form data which includes the filled-in integration keys (conceptually)
      // though for security we might just pass the keys present, not values, to the prompt unless strictly needed.
      const fullConfig = { 
          id: 'temp', 
          userId: 0, 
          templateId: bot.id, 
          templateTitle: bot.title, 
          status: 'active' as const,
          createdAt: '',
          ...formData 
      };
      
      const code = await generateAutomationBlueprint(selectedPlatform, bot.title, fullConfig);
      setBlueprintCode(code);
      setIsGeneratingBlueprint(false);
  };

  const copyBlueprint = () => {
      navigator.clipboard.writeText(blueprintCode);
      alert('Código copiado al portapapeles. Ahora impórtalo en ' + (selectedPlatform === 'n8n' ? 'n8n' : 'Make') + '.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    
    let finalSystemPrompt = formData.systemPrompt;
    if (!finalSystemPrompt) {
        finalSystemPrompt = await generateBotSystemPrompt(bot.title, formData);
    }

    const finalData = { ...formData, systemPrompt: finalSystemPrompt };

    if (existingConfig) {
      onSave(finalData);
    } else {
      appContext?.addUserConfiguration({
          templateId: bot.id,
          templateTitle: bot.title,
          ...finalData,
      });
      onSave(finalData);
    }
  };
  
  const modalTitle = existingConfig ? `Editar: ${bot.title}` : `Configurar Nuevo ${bot.title}`;
  const hasIntegrations = bot.requiredIntegrations && bot.requiredIntegrations.length > 0;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-50 transition-opacity backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl transform transition-all flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white rounded-lg shadow-sm text-primary-600">
                {bot.icon}
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-800">{modalTitle}</h2>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{bot.category}</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
            <button
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'profile' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('profile')}
            >
                1. Perfil de Negocio
            </button>
            <button
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'integrations' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('integrations')}
            >
                2. Credenciales (APIs)
            </button>
            {hasIntegrations && (
                <button
                    className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'blueprint' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('blueprint')}
                >
                    3. ✨ Arquitecto IA
                </button>
            )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
            
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
                <>
                    <div className="bg-gradient-to-r from-primary-50 to-white border border-primary-100 p-6 rounded-xl shadow-sm relative overflow-hidden group">
                         <div className="flex items-center gap-2 mb-3 relative z-10">
                            <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm shadow-primary-200">IA ASSISTANT</span>
                            <h3 className="text-lg font-bold text-gray-900">Autocompletar Datos</h3>
                        </div>
                        <div className="flex gap-3 relative z-10">
                            <input
                                type="text"
                                value={aiDescription}
                                onChange={(e) => setAiDescription(e.target.value)}
                                placeholder="Ej: Pizzería napolitana en Valencia, delivery y reservas..."
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm shadow-sm"
                            />
                            <Button type="button" onClick={handleGenerateWithAI} isLoading={isGenerating}>Autocompletar</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre Comercial</label>
                        <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Teléfono</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Horario</label>
                        <input type="text" name="hours" value={formData.hours} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Servicios y Precios</label>
                    <textarea name="services" value={formData.services} onChange={handleChange} required rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-semibold text-gray-600 hover:text-primary-600 flex items-center">
                            {showAdvanced ? 'Ocultar' : 'Mostrar'} Prompt del Sistema
                        </button>
                        {showAdvanced && (
                            <textarea name="systemPrompt" value={formData.systemPrompt} onChange={handleChange} rows={6} className="w-full mt-2 bg-gray-800 text-green-400 font-mono text-xs p-4 rounded-lg border border-gray-700 outline-none" />
                        )}
                    </div>
                </>
            )}

            {/* TAB 2: INTEGRATIONS */}
            {activeTab === 'integrations' && (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
                         <div className="flex-shrink-0 mt-0.5"><svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                         <div className="text-sm text-blue-800">
                             <p className="font-semibold">Credenciales Reales Requeridas</p>
                             <p>Introduce tus claves API para que el bot pueda conectarse a tus servicios (Calendly, Twilio, Retell, etc). Estos datos se usan para generar el código de integración.</p>
                         </div>
                    </div>

                    {!hasIntegrations ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            Este bot es autónomo y no requiere claves externas.
                        </div>
                    ) : (
                        bot.requiredIntegrations.map((field) => (
                            <div key={field.key} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <label className="block text-sm font-bold text-gray-800">{field.label}</label>
                                    {field.helpUrl && (
                                        <a href={field.helpUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                                            ¿Dónde conseguirlo? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                                        </a>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-3">{field.helpText}</p>
                                <input
                                    type={field.type}
                                    value={formData.integrationValues[field.key] || ''}
                                    onChange={(e) => handleIntegrationChange(field.key, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none text-sm font-mono text-gray-700"
                                />
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TAB 3: BLUEPRINT ARCHITECT */}
            {activeTab === 'blueprint' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-purple-900 mb-2">Arquitecto de Escenarios IA</h3>
                        <p className="text-sm text-purple-700">
                            Gemini utilizará tus credenciales y reglas de negocio para <strong>escribir el código completo</strong> de tu automatización.
                            Copia el código generado e impórtalo directamente en tu herramienta favorita.
                        </p>
                    </div>

                    <div className="flex gap-4 items-center">
                        <span className="text-sm font-medium text-gray-700">Plataforma destino:</span>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button 
                                type="button"
                                onClick={() => setSelectedPlatform('n8n')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedPlatform === 'n8n' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                n8n
                            </button>
                            <button 
                                type="button"
                                onClick={() => setSelectedPlatform('make')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedPlatform === 'make' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Make (Integromat)
                            </button>
                        </div>
                        <Button type="button" onClick={handleGenerateBlueprint} isLoading={isGeneratingBlueprint} className="ml-auto bg-purple-600 hover:bg-purple-700">
                            {isGeneratingBlueprint ? 'Diseñando Arquitectura...' : 'Generar Blueprint'}
                        </Button>
                    </div>

                    {blueprintCode && (
                        <div className="relative">
                            <div className="absolute top-2 right-2">
                                <button type="button" onClick={copyBlueprint} className="bg-gray-800 text-white text-xs px-3 py-1 rounded hover:bg-gray-700 transition-colors">
                                    Copiar Código
                                </button>
                            </div>
                            <textarea 
                                readOnly 
                                value={blueprintCode} 
                                className="w-full h-64 bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-lg border border-gray-700 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Copia este JSON. En {selectedPlatform === 'n8n' ? 'n8n: crea un nuevo workflow y pulsa Ctrl+V' : 'Make: crea un nuevo escenario, click derecho y "Import Blueprint" (requiere plugin o herramienta de importación)'}.
                            </p>
                        </div>
                    )}
                </div>
            )}

          </div>
          
          {/* Footer Navigation */}
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
             <div className="text-xs text-gray-400 italic">
                {activeTab === 'profile' && 'Paso 1: Define el negocio'}
                {activeTab === 'integrations' && 'Paso 2: Introduce credenciales'}
                {activeTab === 'blueprint' && 'Paso 3: Obtén el código'}
            </div>
            <div className="flex space-x-3">
                {activeTab !== 'profile' && (
                     <Button type="button" variant="secondary" onClick={() => setActiveTab(activeTab === 'blueprint' ? 'integrations' : 'profile')}>Atrás</Button>
                )}
                
                {activeTab === 'profile' && (
                     <Button type="button" onClick={() => setActiveTab('integrations')}>Siguiente: APIs &rarr;</Button>
                )}
                
                {activeTab === 'integrations' && hasIntegrations && (
                     <Button type="button" onClick={() => setActiveTab('blueprint')} className="bg-purple-600 hover:bg-purple-700 text-white">Ir al Arquitecto IA &rarr;</Button>
                )}
                
                {/* Always allow saving */}
                <Button type="submit" isLoading={isSaving} className={activeTab === 'blueprint' || !hasIntegrations ? "bg-green-600 hover:bg-green-700" : "bg-primary-600"}>
                    {isSaving ? 'Guardando...' : 'Finalizar y Guardar'}
                </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigurationModal;