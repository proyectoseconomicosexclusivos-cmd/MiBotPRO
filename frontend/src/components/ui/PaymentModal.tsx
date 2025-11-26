import React, { useState } from 'react';
import { BotTemplate, UserConfiguration } from '../../types';
import Button from './Button';
import request from '../../services/api';

interface PaymentModalProps {
  config: UserConfiguration;
  botTemplate: BotTemplate;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ config, botTemplate, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const { url: stripeUrl } = await request('/api/payments/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ configId: config.id }),
      });

      if (stripeUrl) {
        window.location.href = stripeUrl; // Redirect to Stripe
      } else {
        setError('No se pudo iniciar la sesión de pago.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(`Error: ${message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Confirmar Activación</h2>
        </div>

        <div className="p-6">
            <>
              <p className="text-sm text-gray-600 mb-4">
                Estás a punto de activar el bot <strong className="font-semibold">{botTemplate.title}</strong> para tu negocio <strong className="font-semibold">{config.businessName}</strong>.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800">Total a pagar:</span>
                  <span className="text-2xl font-bold text-gray-900">{botTemplate.price}€</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Serás redirigido a Stripe para completar el pago de forma segura.
              </p>
              {error && <p className="text-sm text-red-600 mt-4 text-center">{error}</p>}
            </>
        </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handlePayment} isLoading={isProcessing}>
              {isProcessing ? 'Procesando...' : 'Pagar con Stripe'}
            </Button>
          </div>
      </div>
    </div>
  );
};

export default PaymentModal;
