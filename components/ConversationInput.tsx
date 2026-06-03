
import React, { useState, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

import Card from './ui/Card';
import Button from './ui/Button';
import { MicIcon, UploadIcon, XIcon } from './ui/Icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { EXAMPLE_CONVERSATIONS } from '../constants';
import PdfPreviewModal from './PdfPreviewModal';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;

const resizeImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
                if (width > height) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                } else {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                // Compress as JPEG to save huge amount of bandwidth and token usage
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            } else {
                resolve(base64Str);
            }
        };
        img.onerror = () => {
            resolve(base64Str);
        };
    });
};

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

    const { isListening, isSupported, toggle: toggleListening } = useSpeechRecognition(handleSpeechResult);

    const handleSubmit = () => {
        let finalConversation = conversation;
        const maxChars = 300000;
        if (conversation && conversation.length > maxChars) {
            finalConversation = conversation.slice(0, maxChars);
            alert(`Huch, das ist aber ein langer Roman, mein Kind! Oma hat das Gespräch gekürzt auf die ersten ${maxChars} Zeichen, damit sie beim Lesen nicht einschläft.`);
        }
        onAnalyze(finalConversation, context, imageBase64 || undefined);
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
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const maxChars = 300000;
                if (text && text.length > maxChars) {
                    setConversation(text.slice(0, maxChars));
                    alert(`Das ist eine Riesen-Textdatei! Oma liest nur die ersten ${maxChars} Zeichen, um ihre Augen zu schonen.`);
                } else {
                    setConversation(text || '');
                }
            };
            reader.readAsText(file);
        } else if (file.type === 'application/pdf') {
            setPdfFile(file);
        } else if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const rawBase64 = e.target?.result as string;
                try {
                    const compressed = await resizeImage(rawBase64);
                    setImageBase64(compressed);
                } catch (err) {
                    setImageBase64(rawBase64);
                }
            };
            reader.readAsDataURL(file);
        } else {
            alert("Oma kann nur .txt, .pdf oder Bilder lesen, mein Kind.");
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    e.preventDefault();
                    handleFile(file);
                    break;
                }
            }
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
                                onPaste={handlePaste}
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

                    {isSupported && (
                        <button
                            title={isListening ? "Aufnahme stoppen" : "Diktieren"}
                            onClick={toggleListening}
                            className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 hover:text-white'}`}
                        >
                            <MicIcon className="h-5 w-5" />
                        </button>
                    )}
                    
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
