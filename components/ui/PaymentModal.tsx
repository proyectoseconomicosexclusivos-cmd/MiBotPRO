import React, { useState, useContext } from 'react';
import { BotTemplate, UserConfiguration } from '../../types';
import { AppContext } from '../../App';
import Button from './Button';
import { sendConfigurationToWebhook } from '../../services/n8nService';

interface PaymentModalProps {
  config: UserConfiguration;
  botTemplate: BotTemplate;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ config, botTemplate, onClose, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const appContext = useContext(AppContext);

  const handlePayment = async () => {
    if (!appContext || !appContext.currentUser) {
        setError("No has iniciado sesión.");
        return;
    }
    setIsProcessing(true);
    setError(null);

    // 1. Set status to 'processing'
    appContext.updateUserConfiguration(config.id, { status: 'processing' });
    
    // 2. Simulate payment and backend processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Send data to n8n webhook
    const result = await sendConfigurationToWebhook(config, appContext.settings, appContext.currentUser);
    
    if (result.success) {
      // 4a. If webhook call is successful, set status to 'active'
      appContext.updateUserConfiguration(config.id, { status: 'active' });
      setIsSuccess(true);
      // Wait a bit on the success screen before closing
      setTimeout(() => {
        onPaymentSuccess();
      }, 2500);
    } else {
      // 4b. If webhook fails, set status to 'error' and show message
      appContext.updateUserConfiguration(config.id, { status: 'error' });
      setError(result.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all"  onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Confirmar Activación</h2>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">¡Activación Exitosa!</h3>
                <p className="mt-2 text-sm text-gray-600">Tu bot ha sido activado. Verás el estado actualizado en tu panel.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Estás a punto de activar el bot <strong>{botTemplate.title}</strong> para <strong>{config.businessName}</strong>.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800">Total a pagar (simulado):</span>
                  <span className="text-2xl font-bold text-gray-900">{botTemplate.price}€</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Este es un pago simulado. Al confirmar, se activará el bot y se enviarán los datos a tu webhook de n8n.
              </p>
              {error && <p className="text-sm text-red-600 mt-4 text-center">{error}</p>}
            </>
          )}
        </div>

        {!isSuccess && (
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handlePayment} isLoading={isProcessing}>
              {isProcessing ? 'Procesando...' : 'Confirmar y Activar'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;