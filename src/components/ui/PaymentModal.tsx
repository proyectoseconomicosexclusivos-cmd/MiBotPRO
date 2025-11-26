import React, { useState, useContext } from 'react';
import { BotTemplate, UserConfiguration } from '../../types';
import { AppContext } from '../../App';
import Button from './Button';

interface PaymentModalProps {
  config: UserConfiguration;
  botTemplate: BotTemplate;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ config, botTemplate, onClose, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appContext = useContext(AppContext);

  const handleRedirectToStripe = () => {
    if (!appContext?.settings.stripePaymentLink) {
        setError("Error de configuración: El dueño de la aplicación no ha configurado el enlace de Stripe en Ajustes.");
        return;
    }

    setIsProcessing(true);
    
    // 1. Guardamos en el navegador qué bot estamos intentando pagar.
    // Cuando vuelvan de Stripe, leeremos esto para activar el bot correcto.
    localStorage.setItem('pending_activation_bot_id', config.id);
    
    // 2. Redirigimos al usuario a Stripe
    window.location.href = appContext.settings.stripePaymentLink;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">S</span>
            Suscripción Segura
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <div className="p-8">
            <div className="flex items-start space-x-4 mb-8">
            <div className="bg-primary-50 p-3 rounded-xl border border-primary-100 text-primary-600">
                {botTemplate.icon}
            </div>
            <div>
                <h3 className="font-bold text-xl text-gray-900">{botTemplate.title}</h3>
                <p className="text-sm text-gray-500">Activación para <span className="font-semibold text-gray-700">{config.businessName}</span></p>
            </div>
            </div>
            
            <div className="space-y-4 mb-8 bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                <div className="flex justify-between items-center pb-3 border-b border-indigo-200 border-dashed">
                    <span className="text-indigo-900 text-sm font-medium">Suscripción Mensual</span>
                    <span className="font-bold text-indigo-900 text-lg">{botTemplate.price},00 €</span>
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                    Al suscribirte, serás redirigido a la plataforma segura de Stripe. El cargo es recurrente. Puedes cancelar en cualquier momento.
                    <br/><br/>
                    <strong>Importante:</strong> El bot solo funcionará mientras la suscripción esté activa.
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-3">
                 <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>
                    Cancelar
                </Button>
                <Button onClick={handleRedirectToStripe} isLoading={isProcessing} className="py-3 px-6 shadow-lg shadow-primary-500/20 bg-indigo-600 hover:bg-indigo-700 border-transparent">
                   Suscribirse con Stripe &rarr;
                </Button>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-wide">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                Procesado por Stripe
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;