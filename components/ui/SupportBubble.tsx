import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToAI } from '../../services/chatService';
import Button from './Button';

const SupportBubble: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([
        { text: '¡Hola! Soy tu asistente de MiBotPro. ¿Cómo puedo ayudarte hoy?', sender: 'ai' },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleSend = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage = { text: inputValue, sender: 'user' as const };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        
        const aiResponse = await sendMessageToAI(inputValue);
        
        const aiMessage = { text: aiResponse, sender: 'ai' as const };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            <div className={`fixed bottom-5 right-5 z-40 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
                <button
                    onClick={handleToggle}
                    className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    aria-label="Abrir chat de soporte"
                >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            </div>

            <div className={`fixed bottom-5 right-5 z-40 w-full max-w-sm h-[70vh] flex flex-col bg-white rounded-xl shadow-2xl transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div className="flex justify-between items-center p-4 bg-primary-600 text-white rounded-t-xl">
                    <h3 className="font-bold text-lg">Soporte IA</h3>
                    <button onClick={handleToggle} className="hover:bg-primary-700 p-1 rounded-full" aria-label="Cerrar chat de soporte">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
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

                <div className="p-4 border-t bg-white rounded-b-xl">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe tu pregunta..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                            disabled={isLoading}
                        />
                        <Button onClick={handleSend} isLoading={isLoading} className="rounded-full !px-3 !py-3">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SupportBubble;