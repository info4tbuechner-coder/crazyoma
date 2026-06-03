
import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import ResultsSkeleton from './ResultsSkeleton';
import ScoreGauge from './ScoreGauge';
import PatternCard from './PatternCard';
import AdviceCard from './AdviceCard';
import SentimentChart from './SentimentChart';
import PrintPreviewModal from './PrintPreviewModal';
import OmaChat from './OmaChat';
import { BookOpenIcon, LightBulbIcon, DownloadIcon, SpeakerIcon } from './ui/Icons';
import { generateOmaSpeech, playPcmAudio } from '../services/geminiService';

type AnalysisState = {
    status: 'idle' | 'loading' | 'success' | 'error';
    data: AnalysisResult | null;
    error: string | null;
};

interface AnalysisDisplayProps {
    state: AnalysisState;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ state }) => {
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    if (state.status === 'loading') return <ResultsSkeleton />;
    if (state.status === 'error') return (
        <Card><div className="text-center py-12"><p className="text-2xl mb-4">👵</p><h3 className="text-lg font-semibold text-red-400">Huch!</h3><p className="text-slate-400 mt-2">{state.error}</p></div></Card>
    );
    if (state.status === 'idle' || !state.data) return (
        <Card><div className="text-center py-20"><p className="text-5xl mb-4">👵</p><h3 className="text-2xl font-bold font-serif text-white">Omas offenes Ohr</h3><p className="text-slate-400 mt-2 max-w-md mx-auto">Gib mir links den Text oder einen Screenshot, und ich schau mir das mal an. Oma entgeht nichts!</p></div></Card>
    );
    
    const result = state.data;

    const handleReadFazit = async () => {
        if (isSpeaking) return;
        setIsSpeaking(true);
        try {
            const pcm = await generateOmaSpeech(result.omas_ratschlag.fazit);
            await playPcmAudio(pcm);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSpeaking(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-yellow-900/40 border border-yellow-700/50 text-yellow-200/80 px-4 py-2 rounded-lg text-xs" role="alert">
                <p><strong>Hinweis von Oma:</strong> Das ist Lebenserfahrung, keine Diagnose. Wenn es brennt, geh bitte zum Profi.</p>
            </div>
            
            <Card padding="lg">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Omas Analyse
                        </h2>
                        <p className="text-slate-500 text-xs mt-1 italic">Vom {new Date(result.timestamp).toLocaleString('de-DE')}</p>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="secondary" size="sm" onClick={() => setIsPrintModalOpen(true)}>
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-slate-900/40 p-6 rounded-xl border border-slate-800/60 mb-8">
                    <ScoreGauge score={result.narzissmus_score} />
                    <div className="md:col-span-2">
                        <h3 className="font-bold font-serif text-white text-lg mb-2">Omas Einschätzung</h3>
                        <p className="text-slate-300 italic leading-relaxed">"{result.zusammenfassung}"</p>
                    </div>
                </div>

                <section className="mb-10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                        </div>
                        Die Gefühlskurve (Toxizität)
                    </h3>
                    <div className="h-64 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                        <SentimentChart data={result.sentiment_flow} />
                    </div>
                </section>

                <section className="mb-10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                            <LightBulbIcon className="h-5 w-5"/>
                        </div>
                        Muster-Check
                    </h3>
                    <div className="space-y-3">
                        {result.erkannte_muster.map((p, i) => <PatternCard key={i} pattern={p} />)}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-pink-500/10 text-pink-400">
                                <BookOpenIcon className="h-5 w-5"/>
                            </div>
                            Omas Weisheiten
                        </h3>
                        <button 
                            onClick={handleReadFazit}
                            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-all ${isSpeaking ? 'bg-pink-500 border-pink-400 text-white animate-pulse' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}
                        >
                            <SpeakerIcon className="h-3.5 w-3.5" />
                            {isSpeaking ? 'Oma spricht...' : 'Fazit vorlesen'}
                        </button>
                    </div>
                    <p className="bg-pink-900/20 border-l-4 border-pink-500 p-4 rounded-r-lg text-slate-300 italic mb-4">"{result.omas_ratschlag.fazit}"</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {result.omas_ratschlag.tipps.map((tip, i) => <AdviceCard key={i} advice={tip} />)}
                    </div>
                </section>

                {/* NEU: Interaktives Chat-Stübchen */}
                <OmaChat analysisId={result.id} />
            </Card>

            {isPrintModalOpen && <PrintPreviewModal result={result} onClose={() => setIsPrintModalOpen(false)} />}
        </div>
    );
};

export default AnalysisDisplay;
