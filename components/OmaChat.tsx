
import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, generateOmaSpeech, playPcmAudio, stopCurrentSpeech } from '../services/geminiService';
import type { ChatMessage, AnalysisResult } from '../types';
import Button from './ui/Button';
import { SpeakerIcon, ChatIcon } from './ui/Icons';

interface OmaChatProps {
    result: AnalysisResult;
}

const OmaChat: React.FC<OmaChatProps> = ({ result }) => {
    const analysisId = result.id;
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // Stop speech when the chat is unmounted or analysisId changes
        return () => {
            stopCurrentSpeech().catch(() => {});
        };
    }, [analysisId]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const omaText = await sendChatMessage(analysisId, input, result);
            const omaMsg: ChatMessage = { role: 'model', text: omaText, timestamp: Date.now() };
            setMessages(prev => [...prev, omaMsg]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSpeak = async (text: string) => {
        if (currentlySpeaking === text) {
            await stopCurrentSpeech();
            setCurrentlySpeaking(null);
            return;
        }
        
        setCurrentlySpeaking(text);
        try {
            const pcm = await generateOmaSpeech(text);
            await playPcmAudio(pcm);
        } catch (err) {
            console.error(err);
            setCurrentlySpeaking(null);
        } finally {
            setCurrentlySpeaking(prev => prev === text ? null : prev);
        }
    };

    return (
        <div className="mt-8 border-t border-slate-800 pt-8 animate-fade-in-up">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                    <ChatIcon className="h-5 w-5"/>
                </div>
                Omas Chat-Stübchen
            </h3>
            
            <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 shadow-inner">
                <div ref={scrollRef} className="h-64 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                    {messages.length === 0 && (
                        <p className="text-slate-500 text-center py-10 italic">
                            Hast du noch Fragen zu der Analyse, Kindchen? Trau dich!
                        </p>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-md ${
                                msg.role === 'user' 
                                ? 'bg-purple-600 text-white rounded-tr-none' 
                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none relative group'
                            }`}>
                                {msg.text}
                                {msg.role === 'model' && (
                                    <button 
                                        onClick={() => handleSpeak(msg.text)}
                                        className={`absolute -right-10 top-1/2 -translate-y-1/2 p-2 transition-all ${
                                            currentlySpeaking === msg.text 
                                                ? 'text-pink-500 opacity-100' 
                                                : 'text-slate-500 hover:text-pink-400 opacity-0 group-hover:opacity-100'
                                        }`}
                                        title="Oma vorlesen lassen"
                                    >
                                        <SpeakerIcon className={`h-4 w-4 ${currentlySpeaking === msg.text ? 'animate-pulse' : ''}`} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none animate-pulse text-slate-400 text-xs">
                                Oma überlegt...
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Frag Oma was..."
                        className="flex-grow bg-slate-950/50 border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                    />
                    <Button onClick={handleSend} size="sm" disabled={isLoading || !input.trim()}>
                        Senden
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OmaChat;
