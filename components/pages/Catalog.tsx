import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import BotCard from '../ui/BotCard';
import ConfigurationModal from '../ui/ConfigurationModal';
import { BOT_TEMPLATES } from '../../data/bots';
import { BotTemplate } from '../../types';
import { AppContext } from '../../App';

const Catalog: React.FC = () => {
  const [selectedBot, setSelectedBot] = useState<BotTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const appContext = useContext(AppContext);
  const navigate = useNavigate();

  const handleConfigure = (bot: BotTemplate) => {
    if (!appContext?.currentUser) {
      navigate('/login');
      return;
    }
    setSelectedBot(bot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBot(null);
  };

  const handleSaveConfiguration = () => {
    // After a new bot is saved in the modal, close it and go to the dashboard
    // to see the newly created configuration.
    handleCloseModal();
    navigate('/dashboard');
  };

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Automatización con IA para tu Negocio
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          Explora nuestro catálogo de asistentes virtuales y encuentra la solución perfecta para tus necesidades.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {BOT_TEMPLATES.map((bot) => (
          <BotCard key={bot.id} bot={bot} onConfigure={handleConfigure} />
        ))}
      </div>
      {isModalOpen && selectedBot && (
        <ConfigurationModal
          bot={selectedBot}
          onClose={handleCloseModal}
          onSave={handleSaveConfiguration}
        />
      )}
    </>
  );
};

export default Catalog;