
import React from 'react';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';
import { AnalysisResult } from '../types';
import { XIcon, TrashIcon, DownloadIcon } from './ui/Icons';
import Button from './ui/Button';

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadAnalysis: (result: AnalysisResult) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, onLoadAnalysis }) => {
    const { history, removeAnalysis, clearHistory } = useAnalysisHistory();

    const exportHistory = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(history, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `crazy_oma_history_${new Date().toISOString()}.json`;
        link.click();
    };
    
    return (
        <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'bg-black/60' : 'pointer-events-none'}`} onClick={onClose}>
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-800">
                        <h2 className="text-lg font-semibold text-white">Analyse-Verlauf</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white">
                            <XIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {history.length > 0 ? (
                        <>
                            <div className="flex-grow overflow-y-auto p-4 space-y-3">
                                {history.map((item) => (
                                    <div key={item.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-semibold text-purple-300">{new Date(item.timestamp).toLocaleString('de-DE')}</p>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.original_text}</p>
                                            </div>
                                            <button onClick={() => removeAnalysis(item.id)} className="text-slate-500 hover:text-red-400 p-1 flex-shrink-0">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="mt-2">
                                            <button onClick={() => onLoadAnalysis(item)} className="text-sm font-semibold text-pink-400 hover:text-pink-300">
                                                Analyse laden
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <div className="p-4 border-t border-slate-800 flex gap-2">
                                <Button onClick={exportHistory} variant="secondary" size="sm" className="flex-1 flex items-center justify-center gap-2">
                                    <DownloadIcon className="h-4 w-4" />
                                    Exportieren
                                </Button>
                                <Button onClick={clearHistory} variant="danger" size="sm" className="flex-1 flex items-center justify-center gap-2">
                                    <TrashIcon className="h-4 w-4" />
                                    Alles löschen
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-center p-4">
                            <p className="text-slate-500">Oma hat noch nichts zum Speichern. Führe deine erste Analyse durch!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistorySidebar;
