import React, { useState, useRef, useEffect } from 'react';
import { UserConfiguration } from '../../types';
import { getBotResponse } from '../../services/botRunnerService';

interface UniversalChatInterfaceProps {
    config: UserConfiguration;
}

interface Message {
    text?: string;
    sender: 'user' | 'ai';
    isSystem?: boolean;
    toolCall?: {
        name: string;
        args: any;
        result: any;
    };
}

const UniversalChatInterface: React.FC<UniversalChatInterfaceProps> = ({ config }) => {
    const [messages, setMessages] = useState<Message[]>([
        { text: `¡Hola! 👋 Soy el asistente de ${config.businessName}. Estoy conectado y listo. ¿En qué puedo ayudarte?`, sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSend = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        const userText = inputValue;
        const userMessage: Message = { text: userText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        
        const history = messages
            .filter(m => !m.isSystem && m.text) 
            .map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text || '' }]
            })) as { role: 'user' | 'model', parts: { text: string }[] }[];

        setInputValue('');
        setIsLoading(true);

        const aiResponse = await getBotResponse(config, userText, history);
        
        if (aiResponse.functionCall) {
            const { name, args, result } = aiResponse.functionCall;
            
            const systemMsg: Message = { 
                sender: 'ai',
                isSystem: true,
                toolCall: { name, args, result }
            };
            
            const followUpMsg: Message = {
                text: aiResponse.text,
                sender: 'ai'
            };
            
            setMessages(prev => [...prev, systemMsg, followUpMsg]);

        } else if (aiResponse.text) {
            const aiMessage: Message = { text: aiResponse.text, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        }
        
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const formatToolName = (name: string) => {
        return name.replace(/_/g, ' ').toUpperCase();
    };

    const formatToolResult = (result: any) => {
        return JSON.stringify(result, null, 2);
    };

    return (
        <div className="flex flex-col h-[70vh] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 relative">
             <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between z-10">
                 <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium text-gray-500">Online • Integraciones Activas</span>
                 </div>
                 <div className="text-xs text-gray-400">{config.hours}</div>
             </div>

             <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        
                        {msg.sender === 'ai' && !msg.isSystem && (
                            <div className="flex items-center gap-2 mb-1 ml-1">
                                <div className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[10px] shadow-sm">🤖</div>
                                <span className="text-[10px] text-gray-400 font-medium">Bot</span>
                            </div>
                        )}

                        {msg.isSystem && msg.toolCall && (
                            <div className="w-full flex justify-center my-2">
                                <div className="bg-slate-800 text-slate-200 rounded-md text-xs font-mono shadow-lg max-w-md w-full border border-slate-700 overflow-hidden">
                                    <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-700 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            <span className="font-bold text-purple-400">EXTERNAL API CALL</span>
                                        </div>
                                        <span className="text-[10px] bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded">SENT</span>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase mb-0.5">Payload</div>
                                            <div className="text-yellow-100 break-words">{JSON.stringify(msg.toolCall.args)}</div>
                                        </div>
                                        <div className="border-t border-slate-700 pt-2">
                                             <div className="text-[10px] text-slate-500 uppercase mb-0.5">Response</div>
                                             <pre className="text-green-300 overflow-x-auto whitespace-pre-wrap">{formatToolResult(msg.toolCall.result)}</pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {msg.text && (
                            <div className={`max-w-[85%] px-4 py-3 shadow-sm text-sm leading-relaxed ${
                                msg.sender === 'user' 
                                    ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm' 
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        )}
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start animate-in fade-in duration-300 ml-1">
                         <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

             <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 focus-within:bg-white transition-all shadow-sm">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                        disabled={isLoading}
                        autoFocus
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={isLoading || !inputValue.trim()}
                        className={`p-2 rounded-full transition-all flex-shrink-0 ${
                            inputValue.trim() 
                                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md transform hover:scale-105' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UniversalChatInterface;