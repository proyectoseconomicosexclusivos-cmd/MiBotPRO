import React, { useState, useContext } from 'react';
import BotCard from '../ui/BotCard';
import ConfigurationModal from '../ui/ConfigurationModal';
import { BOT_TEMPLATES } from '../../data/bots';
import { BotTemplate, UserConfiguration } from '../../types';
import { AppContext } from '../../App';
import { useNavigate } from 'react-router-dom';

const Catalog = () => {
  const [selectedBot, setSelectedBot] = useState<BotTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const appContext = useContext(AppContext);
  const navigate = useNavigate();

  const handleConfigure = (bot: BotTemplate) => {
    if (!appContext?.currentUser) {
      // If the user is not logged in, send them to login.
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

  const handleSaveConfiguration = (newConfig: UserConfiguration) => {
    // The modal now handles navigation, so we just close it.
    handleCloseModal();
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