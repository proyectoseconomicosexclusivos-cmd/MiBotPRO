import React from 'react';
import { BotTemplate } from '../../types';
import Button from './Button';

interface BotCardProps {
  bot: BotTemplate;
  onConfigure: (bot: BotTemplate) => void;
}

const BotCard: React.FC<BotCardProps> = ({ bot, onConfigure }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col overflow-hidden">
      <div className="p-6 flex-grow">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 bg-primary-50 rounded-lg p-2">
            {bot.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{bot.title}</h3>
            <p className="text-sm font-medium text-primary-600">{bot.category}</p>
          </div>
        </div>
        <p className="mt-4 text-gray-600 text-sm h-20">{bot.description}</p>
      </div>
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Integraciones</h4>
            <div className="flex flex-wrap gap-2">
                {bot.integrations.map(integration => (
                    <span key={integration} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">{integration}</span>
                ))}
            </div>
        </div>
        <div className="text-center my-4">
            <span className="text-3xl font-bold text-gray-900">{bot.price}€</span>
            <span className="text-sm text-gray-500"> / activación</span>
        </div>
        <Button onClick={() => onConfigure(bot)} fullWidth>
          Activar Bot
        </Button>
      </div>
    </div>
  );
};

export default BotCard;