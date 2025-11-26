import React from 'react';
import { UserConfiguration } from '../../types';
import Button from './Button';

interface DashboardCardProps {
  config: UserConfiguration;
  onDelete: (id: string) => void;
  onEdit: (config: UserConfiguration) => void;
  onPay: (config: UserConfiguration) => void;
}

const statusStyles: { [key in UserConfiguration['status']]: { bg: string; text: string; dot: string; label: string } } = {
  pending_payment: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-400',
    label: 'Pendiente de Pago'
  },
  processing: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-400',
    label: 'Procesando'
  },
  active: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
    label: 'Activo'
  },
  suspended: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
    label: 'SUSPENDIDO / IMPAGO'
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
    label: 'Error'
  }
};

const DashboardCard: React.FC<DashboardCardProps> = ({ config, onDelete, onEdit, onPay }) => {
  const currentStatus = statusStyles[config.status] || statusStyles.error;

  return (
    <div className={`bg-white rounded-lg shadow-md flex flex-col ${config.status === 'suspended' ? 'border-2 border-red-200' : ''}`}>
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">{config.templateTitle}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${currentStatus.bg} ${currentStatus.text}`}>
            <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${currentStatus.dot}`} fill="currentColor" viewBox="0 0 8 8">
              <circle cx={4} cy={4} r={3} />
            </svg>
            {currentStatus.label}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{config.businessName}</p>
        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <p><strong className="font-medium">Teléfono:</strong> {config.phone}</p>
          <p><strong className="font-medium">Email:</strong> {config.email}</p>
          <p><strong className="font-medium">Creado:</strong> {new Date(config.createdAt).toLocaleDateString()}</p>
        </div>
        
        {config.status === 'suspended' && (
            <div className="mt-4 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                <strong>Atención:</strong> El servicio se ha detenido porque el último pago falló. Actualiza tu método de pago para reactivar.
            </div>
        )}
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-end space-x-2">
           {(config.status === 'pending_payment' || config.status === 'suspended') && (
             <Button
                onClick={() => onPay(config)}
                variant="primary"
                className={`text-sm py-1 px-3 ${config.status === 'suspended' ? '!bg-red-600 hover:!bg-red-700' : ''}`}
             >
                {config.status === 'suspended' ? 'Reactivar Pago' : 'Activar Bot'}
             </Button>
           )}
          <Button variant="secondary" className="text-sm py-1 px-3" onClick={() => onEdit(config)} disabled={config.status === 'processing'}>Editar</Button>
          <Button variant="secondary" onClick={() => onDelete(config.id)} className="text-sm py-1 px-3 !bg-red-100 !text-red-700 hover:!bg-red-200 focus:!ring-red-300">Eliminar</Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;