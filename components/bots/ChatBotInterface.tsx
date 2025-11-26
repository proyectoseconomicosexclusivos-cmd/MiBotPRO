import React, { useState, useRef, useEffect } from 'react';
import { UserConfiguration } from '../../types';
import { getBotResponse } from '../../services/botRunnerService';
import Button from '../ui/Button';

interface ChatBotInterfaceProps {
    config: UserConfiguration;
}

const ChatBotInterface: React.FC<ChatBotInterfaceProps> = ({ config }) => {
    const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([
        { text: `¡Hola! Soy tu asistente para ${config.businessName}. ¿Cómo puedo ayudarte?`, sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage = { text: inputValue, sender: 'user' as const };
        setMessages(prev => [...prev, userMessage]);
        
        const history = messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        setInputValue('');
        setIsLoading(true);

        const aiResponse = await getBotResponse(config, inputValue, history);
        
        const aiMessage = { text: aiResponse.text || 'No he podido procesar tu solicitud.', sender: 'ai' as const };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[65vh]">
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 rounded-t-lg">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'ai' && (
                                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">IA</div>
                            )}
                            <div className={`max-w-[80%] p-3 rounded-xl ${msg.sender === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">IA</div>
                            <div className="max-w-[80%] p-3 rounded-xl bg-gray-200 text-gray-800 rounded-bl-none">
                                <div className="flex items-center justify-center space-x-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="p-4 border-t bg-white rounded-b-lg">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={isLoading}
                    />
                    <Button onClick={handleSend} isLoading={isLoading} className="rounded-full !px-3 !py-3">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatBotInterface;