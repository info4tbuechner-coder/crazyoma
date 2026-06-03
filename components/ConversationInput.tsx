
import React, { useState, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

import Card from './ui/Card';
import Button from './ui/Button';
import { MicIcon, UploadIcon, XIcon } from './ui/Icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { EXAMPLE_CONVERSATIONS } from '../constants';
import PdfPreviewModal from './PdfPreviewModal';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^5.4.296/build/pdf.worker.js`;

interface ConversationInputProps {
    onAnalyze: (conversation: string, context: string, imageBase64?: string) => void;
    isLoading: boolean;
}

const ConversationInput: React.FC<ConversationInputProps> = ({ onAnalyze, isLoading }) => {
    const [conversation, setConversation] = useState('');
    const [context, setContext] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSpeechResult = useCallback((transcript: string) => {
        setConversation(prev => prev + transcript + ' ');
    }, []);

    const { isListening, toggle: toggleListening } = useSpeechRecognition(handleSpeechResult);

    const handleSubmit = () => {
        onAnalyze(conversation, context, imageBase64 || undefined);
    };

    const handleClear = () => {
        setConversation('');
        setContext('');
        setImageBase64(null);
    };

    const loadExample = (example: { conversation: string, context: string }) => {
        setConversation(example.conversation);
        setContext(example.context);
        setImageBase64(null);
    };

    const handleFile = (file: File) => {
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => setConversation(e.target?.result as string);
            reader.readAsText(file);
        } else if (file.type === 'application/pdf') {
            setPdfFile(file);
        } else if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setImageBase64(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            alert("Oma kann nur .txt, .pdf oder Bilder lesen, mein Kind.");
        }
    };
    
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.length > 0) handleFile(e.dataTransfer.files[0]);
    };

    return (
        <Card className="sticky top-20">
            <h2 className="text-lg font-semibold text-white mb-4">Erzähl Oma, was los ist</h2>
            <div className="space-y-4">
                <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    className={`relative transition-all duration-300 ${isDragging ? 'ring-2 ring-purple-400 ring-dashed rounded-lg' : ''}`}
                >
                    <div className="relative">
                        <label htmlFor="conversation" className="block text-sm font-medium text-slate-400">Gesprächsverlauf oder Screenshot</label>
                        
                        {imageBase64 ? (
                            <div className="mt-1 relative group">
                                <img src={imageBase64} alt="Vorschau" className="w-full h-48 object-cover rounded-md border border-slate-700" />
                                <button 
                                    onClick={() => setImageBase64(null)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <XIcon className="h-4 w-4" />
                                </button>
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs text-white">
                                    Omas Foto-Auge ist aktiv
                                </div>
                            </div>
                        ) : (
                            <textarea
                                id="conversation"
                                rows={8}
                                value={conversation}
                                onChange={(e) => setConversation(e.target.value)}
                                placeholder="Text hier reinkopieren oder Screenshot hochladen..."
                                className="mt-1 block w-full bg-slate-800/50 border-slate-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm placeholder-slate-500"
                            />
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="context" className="block text-sm font-medium text-slate-400">Was ist passiert? (optional)</label>
                    <input
                        id="context"
                        type="text"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Z.B. 'Streit mit Mama'"
                        className="mt-1 block w-full bg-slate-800/50 border-slate-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm placeholder-slate-500 h-10 px-3"
                    />
                </div>

                <div className="flex items-center gap-2 pt-2">
                     <button
                        title="Bild oder Dokument hochladen"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-10 w-10 flex items-center justify-center text-slate-400 bg-slate-800/50 border border-slate-700 rounded-full hover:bg-slate-700/50 hover:text-white transition-colors"
                    >
                        <UploadIcon className="h-5 w-5"/>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleFile(e.target.files[0])} className="hidden" accept=".txt,.pdf,image/*" />

                    <button
                        title={isListening ? "Aufnahme stoppen" : "Diktieren"}
                        onClick={toggleListening}
                        className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 hover:text-white'}`}
                    >
                        <MicIcon className="h-5 w-5" />
                    </button>
                    
                    <div className="flex-grow"></div>
                    <Button onClick={handleClear} variant="secondary">Leeren</Button>
                    <Button onClick={handleSubmit} isLoading={isLoading} className="px-8">Analyse</Button>
                </div>
            </div>
            {pdfFile && <PdfPreviewModal file={pdfFile} onClose={() => setPdfFile(null)} onExtract={(text) => { setConversation(text); setPdfFile(null); }} />}
        </Card>
    );
};

export default ConversationInput;
