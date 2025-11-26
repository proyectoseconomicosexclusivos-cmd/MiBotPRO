import React, { useState, useCallback, useEffect, useContext } from 'react';
import { BotTemplate, UserConfiguration } from '../../types';
import Button from './Button';
import { getBusinessSuggestions } from '../../services/geminiService';
import { AppContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import request from '../../services/api';

type FormData = Omit<UserConfiguration, 'id' | 'createdAt' | 'status' | 'templateId' | 'templateTitle' | 'userId'>;

interface ConfigurationModalProps {
  bot: BotTemplate;
  onClose: () => void;
  onSave: (config: UserConfiguration) => void; 
  existingConfig?: UserConfiguration;
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({ bot, onClose, onSave, existingConfig }) => {
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    phone: '',
    email: '',
    hours: '',
    services: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const appContext = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!appContext?.currentUser) {
      navigate('/login');
    }
    if (existingConfig) {
      setFormData({
        businessName: existingConfig.businessName,
        phone: existingConfig.phone,
        email: existingConfig.email,
        hours: existingConfig.hours,
        services: existingConfig.services,
      });
    }
  }, [existingConfig, appContext, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateWithAI = useCallback(async () => {
    if (!aiDescription) return;
    setIsGenerating(true);
    try {
      const suggestions = await getBusinessSuggestions(aiDescription);
      if (suggestions) {
        setFormData(prev => ({ ...prev, ...suggestions }));
      }
    } catch (error) {
      console.error("Failed to get AI suggestions:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [aiDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (existingConfig) {
        // This is an update, the parent (Dashboard) handles the API call.
        // We just pass the data up.
        onSave(formData as any); 
      } else {
        // This is a new configuration, we create it here.
        const payload = {
            templateId: bot.id,
            templateTitle: bot.title,
            ...formData,
        };
        await request('/api/configurations', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        navigate('/dashboard'); // Navigate to dashboard after creating a new bot
      }
    } catch (err) {
      alert('Failed to save configuration.');
    } finally {
      setIsSaving(false);
      onClose();
    }
  };
  
  const modalTitle = existingConfig ? `Editar: ${bot.title}` : `Configurar: ${bot.title}`;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{modalTitle}</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            
            <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded-r-lg">
              <h3 className="text-md font-semibold text-primary-800 mb-2">Asistente IA de Configuración</h3>
              <p className="text-sm text-primary-700 mb-3">Describe tu negocio y nuestra IA te ayudará a rellenar los campos.</p>
              <textarea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder="Ej: Somos un taller mecánico en Madrid especializado en coches clásicos."
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                rows={3}
              />
              <Button type="button" onClick={handleGenerateWithAI} isLoading={isGenerating} className="mt-3">
                {isGenerating ? 'Generando...' : 'Generar con IA'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Nombre del Negocio</label>
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono de Contacto</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email de Contacto</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="hours" className="block text-sm font-medium text-gray-700">Horario de Atención</label>
                  <input type="text" name="hours" value={formData.hours} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
            </div>
            <div>
              <label htmlFor="services" className="block text-sm font-medium text-gray-700">Servicios (separados por coma)</label>
              <textarea name="services" value={formData.services} onChange={handleChange} required rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving}>Guardar Configuración</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigurationModal;