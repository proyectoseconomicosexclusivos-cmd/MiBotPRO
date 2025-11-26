import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../App';
import DashboardCard from '../ui/DashboardCard';
import { UserConfiguration } from '../../types';
import ConfigurationModal from '../ui/ConfigurationModal';
import PaymentModal from '../ui/PaymentModal';
import { BOT_TEMPLATES } from '../../data/bots';

const Dashboard: React.FC = () => {
  const appContext = useContext(AppContext);
  const configurations = appContext?.userConfigurations || [];

  const [editingConfig, setEditingConfig] = useState<UserConfiguration | null>(null);
  const [payingConfig, setPayingConfig] = useState<UserConfiguration | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta configuración?')) {
        appContext?.deleteUserConfiguration(id);
    }
  };
  
  const handleUpdate = (id: string, updates: Partial<UserConfiguration>) => {
    appContext?.updateUserConfiguration(id, updates);
  };

  const handleEdit = (config: UserConfiguration) => {
    setEditingConfig(config);
  };
  
  const handleStartPayment = (config: UserConfiguration) => {
    setPayingConfig(config);
  };

  const handleCloseModal = () => {
    setEditingConfig(null);
  };
  
  const handleClosePaymentModal = () => {
    setPayingConfig(null);
  };

  const handleSaveEdits = (updatedData: Omit<UserConfiguration, 'id' | 'createdAt' | 'status' | 'templateId' | 'templateTitle' | 'userId'>) => {
    if (editingConfig) {
      handleUpdate(editingConfig.id, updatedData);
    }
    handleCloseModal();
  };
  
  const botTemplateForModal = editingConfig 
    ? BOT_TEMPLATES.find(b => b.id === editingConfig.templateId) 
    : undefined;
    
  const botTemplateForPayment = payingConfig
    ? BOT_TEMPLATES.find(b => b.id === payingConfig.templateId)
    : undefined;

  return (
    <div>
      <div className="pb-8 border-b border-gray-200 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Panel de Bots</h1>
        <p className="mt-2 text-lg text-gray-500">
          Gestiona tus asistentes virtuales configurados.
        </p>
      </div>

      {configurations.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-lg shadow">
           <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-xl font-medium text-gray-900">No tienes bots configurados</h3>
          <p className="mt-1 text-gray-500">Empieza por explorar nuestro catálogo.</p>
          <div className="mt-6">
            <Link
              to="/catalog"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Ir al Catálogo
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {configurations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(config => (
            <DashboardCard 
              key={config.id} 
              config={config} 
              onDelete={handleDelete}
              onEdit={handleEdit}
              onPay={handleStartPayment}
            />
          ))}
        </div>
      )}
      {editingConfig && botTemplateForModal && (
        <ConfigurationModal
          bot={botTemplateForModal}
          existingConfig={editingConfig}
          onClose={handleCloseModal}
          onSave={handleSaveEdits}
        />
      )}
      {payingConfig && botTemplateForPayment && (
        <PaymentModal
            config={payingConfig}
            botTemplate={botTemplateForPayment}
            onClose={handleClosePaymentModal}
            onPaymentSuccess={() => {
                handleClosePaymentModal();
            }}
        />
      )}
    </div>
  );
};

export default Dashboard;