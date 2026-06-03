
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
import { BookOpenIcon, LightBulbIcon, DownloadIcon, SpeakerIcon, FileIcon } from './ui/Icons';
import { generateOmaSpeech, playPcmAudio, stopCurrentSpeech } from '../services/geminiService';
import { useAuth } from '../AuthContext';
import { createOmaSpreadsheet, appendAnalysisToSheet } from '../services/googleSheetsService';

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
    const { googleAccessToken, loginWithGoogle, isGoogleLoading, user } = useAuth();
    
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [spreadsheetInfo, setSpreadsheetInfo] = useState<{ spreadsheetId: string, spreadsheetUrl: string } | null>(() => {
        const stored = localStorage.getItem(`google_sheets_info_${user?.uid || 'default'}`);
        return stored ? JSON.parse(stored) : null;
    });

    const handleSyncToSheets = async () => {
        if (!state.data) return;
        setIsSyncing(true);
        setSyncMessage(null);
        setSyncError(null);

        try {
            let currentToken = googleAccessToken;
            
            // Wenn der Nutzer noch nicht in dieser Session mit Google angemeldet war, anfordern
            if (!currentToken) {
                setSyncMessage("Oma bereitet die Google-Anmeldung vor...");
                await loginWithGoogle();
                // Nach erfolgreichem Login wird der Token gesetzt. Wir holen ihn direkt aus dem AuthContext 
                // bzw. warten auf den nächsten Render. Um nahtlos weiterzumachen, weisen wir den Nutzer darauf hin, 
                // die Aufzeichnung nochmals zu aktivieren oder wir holen ihn direkt.
                setSyncMessage("Anmeldung erfolgreich! Klicke jetzt auf 'Eintragen', um zu speichern.");
                setIsSyncing(false);
                return;
            }

            let activeId = spreadsheetInfo?.spreadsheetId;
            let activeUrl = spreadsheetInfo?.spreadsheetUrl;

            if (!activeId) {
                setSyncMessage("Oma legt ein neues Tagebuch für dich an... 📝");
                const newSheet = await createOmaSpreadsheet(currentToken);
                activeId = newSheet.spreadsheetId;
                activeUrl = newSheet.spreadsheetUrl;
                
                const info = { spreadsheetId: activeId, spreadsheetUrl: activeUrl };
                setSpreadsheetInfo(info);
                localStorage.setItem(`google_sheets_info_${user?.uid || 'default'}`, JSON.stringify(info));
            }

            setSyncMessage("Ergebnisse werden eingetragen... 👵✍️");
            await appendAnalysisToSheet(currentToken, activeId, state.data);
            
            setSyncMessage(`Erfolgreich ins Tagebuch eingetragen! 🎉`);
        } catch (err: any) {
            console.error("Sheets sync failed:", err);
            setSyncError(err?.message || "Omas Feder ist abgebrochen! Konnte nicht in Google Sheets schreiben.");
        } finally {
            setIsSyncing(false);
        }
    };

    if (state.status === 'loading') return <ResultsSkeleton />;
    if (state.status === 'error') return (
        <Card><div className="text-center py-12"><p className="text-2xl mb-4">👵</p><h3 className="text-lg font-semibold text-red-400">Huch!</h3><p className="text-slate-400 mt-2">{state.error}</p></div></Card>
    );
    if (state.status === 'idle' || !state.data) return (
        <Card><div className="text-center py-20"><p className="text-5xl mb-4">👵</p><h3 className="text-2xl font-bold font-serif text-white">Omas offenes Ohr</h3><p className="text-slate-400 mt-2 max-w-md mx-auto">Gib mir links den Text oder einen Screenshot, und ich schau mir das mal an. Oma entgeht nichts!</p></div></Card>
    );
    
    const result = state.data;
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleReadFazit = async () => {
        if (isSpeaking) {
            await stopCurrentSpeech();
            setIsSpeaking(false);
            return;
        }
        setIsSpeaking(true);
        try {
            const pcm = await generateOmaSpeech(result.omas_ratschlag.fazit);
            await playPcmAudio(pcm);
        } catch (err) {
            console.error(err);
            setIsSpeaking(false);
        } finally {
            setIsSpeaking(false);
        }
    };

    const [isMarkdownCopied, setIsMarkdownCopied] = useState(false);

    const generateMarkdown = (res: AnalysisResult): string => {
        let md = `# Omas Narzissmus- & Manipulations-Analyse\n\n`;
        md += `**Datum / Uhrzeit:** ${new Date(res.timestamp).toLocaleString('de-DE')}\n`;
        md += `**Narzissmus-Score:** ${res.narzissmus_score}/100\n`;
        if (res.manipulations_index !== undefined) {
            md += `**Manipulations-Index:** ${res.manipulations_index}%\n`;
        }
        if (res.gaslighting_level) {
            md += `**Gaslighting-Gefahr:** ${res.gaslighting_level}\n`;
        }
        md += `\n---\n\n`;
        md += `## Omas Einschätzung\n`;
        md += `> "${res.zusammenfassung}"\n\n`;
        if (res.oma_sprichwort) {
            md += `*Omas passendes Sprichwort:* **"${res.oma_sprichwort}"**\n\n`;
        }
        md += `---\n\n`;
        md += `## Erkannte Verhaltensmuster & Taktiken\n\n`;
        res.erkannte_muster.forEach(m => {
            md += `### 🔍 ${m.muster_name}\n`;
            md += `* **Zitat:** "${m.zitat}"\n`;
            md += `* **Omas Erklärung:** ${m.erklaerung}\n\n`;
        });
        
        if (res.gegenrede_tipps && res.gegenrede_tipps.length > 0) {
            md += `---\n\n`;
            md += `## Abgrenzung & Gegenrede (Grey Rocking)\n`;
            md += `Sätze, mit denen du dich klar abgrenzt, ohne neues Futter für Machtspiele zu liefern:\n\n`;
            res.gegenrede_tipps.forEach(sentence => {
                md += `* *"${sentence}"*\n`;
            });
            md += `\n`;
        }

        md += `---\n\n`;
        md += `## Omas Ratschlag & Fazit\n`;
        md += `> "${res.omas_ratschlag.fazit}"\n\n`;
        md += `### Praktische Tipps:\n`;
        res.omas_ratschlag.tipps.forEach(tipp => {
            md += `* **${tipp.titel}:** ${tipp.text}\n`;
        });
        
        md += `\n\n---\n*Generiert mit ❤️ von Crazy Omas Narzissmus-Analyse*`;
        return md;
    };

    const handleDownloadMarkdown = () => {
        const markdownText = generateMarkdown(result);
        const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `omas-narzissmus-analyse-${result.id.slice(0, 8)}.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyMarkdown = () => {
        const markdownText = generateMarkdown(result);
        navigator.clipboard.writeText(markdownText);
        setIsMarkdownCopied(true);
        setTimeout(() => setIsMarkdownCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="bg-yellow-900/40 border border-yellow-700/50 text-yellow-200/80 px-4 py-2 rounded-lg text-xs" role="alert">
                <p><strong>Hinweis von Oma:</strong> Das ist Lebenserfahrung, keine Diagnose. Wenn es brennt, geh bitte zum Profi.</p>
            </div>

            {/* Google Sheets Sync Bar - NEU */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md animate-fade-in-up">
                <div className="flex gap-3 items-start md:items-center">
                    <span className="text-3xl select-none">📊</span>
                    <div>
                        <h4 className="text-white text-sm font-semibold flex items-center gap-1.5">
                            Omas Google-Sheets Tagebuch
                            <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                Live-Verbindung
                            </span>
                        </h4>
                        <p className="text-slate-400 text-xs mt-0.5">
                            Sichere deine Analysen live in einer Google-Tabelle als persönliches Tagebuch.
                        </p>
                        {syncMessage && (
                            <p className="text-purple-400 text-xs mt-1.5 font-medium animate-pulse">
                                👵: "{syncMessage}"
                            </p>
                        )}
                        {syncError && (
                            <p className="text-red-400 text-xs mt-1.5 font-medium">
                                👵: "{syncError}"
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center self-end md:self-center">
                    {spreadsheetInfo?.spreadsheetUrl && (
                        <a 
                            href={spreadsheetInfo.spreadsheetUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/40 text-xs font-semibold py-1.5 px-3 rounded-md shadow-sm transition-all flex items-center gap-1"
                        >
                            <span>📝</span> Tagebuch öffnen ↗
                        </a>
                    )}
                    <Button 
                        onClick={handleSyncToSheets} 
                        disabled={isSyncing || isGoogleLoading}
                        className="text-xs font-bold py-1.5 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
                    >
                        {isSyncing ? 'Oma schreibt...' : (!googleAccessToken ? 'Mit Google verbinden & eintragen' : 'In Sheets eintragen')}
                    </Button>
                </div>
            </div>
            
            <Card padding="lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Omas Analyse
                        </h2>
                        <p className="text-slate-500 text-xs mt-1 italic">Vom {new Date(result.timestamp).toLocaleString('de-DE')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                         <Button variant="secondary" size="xs" onClick={() => setIsPrintModalOpen(true)} className="text-xs py-1.5 px-3">
                            <span className="text-sm mr-1">🖨️</span> Print / PDF
                        </Button>
                         <Button variant="secondary" size="xs" onClick={handleDownloadMarkdown} className="text-xs py-1.5 px-3">
                            <DownloadIcon className="h-3.5 w-3.5 mr-1 text-purple-400 inline-block align-middle" />
                            Markdown laden
                        </Button>
                         <Button variant="secondary" size="xs" onClick={handleCopyMarkdown} className="text-xs py-1.5 px-3">
                            <FileIcon className="h-3.5 w-3.5 mr-1 text-pink-400 inline-block align-middle" />
                            {isMarkdownCopied ? 'Kopiert!' : 'Kopieren'}
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

                {/* NEU: Omas Detektor-Details & Gegenrede */}
                {(result.manipulations_index !== undefined || result.gaslighting_level !== undefined || result.oma_sprichwort !== undefined || result.gegenrede_tipps !== undefined) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up">
                        {/* Detail-Werte & Sprichwort */}
                        <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800/60 flex flex-col justify-between">
                            <div className="space-y-4">
                                <h3 className="font-bold text-white text-md flex items-center gap-2">
                                    <span className="text-xl">🕵️‍♀️</span> Omas Detektor-Details
                                </h3>
                                
                                {result.manipulations_index !== undefined && (
                                    <div>
                                        <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
                                            <span>Manipulations-Index</span>
                                            <span className="font-mono text-purple-400 font-semibold">{result.manipulations_index}%</span>
                                        </div>
                                        <div className="w-full bg-slate-850 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000" 
                                                style={{ width: `${result.manipulations_index}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {result.gaslighting_level && (
                                    <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                                        <span className="text-xs text-slate-400">Gaslighting-Gefahr</span>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold font-mono ${
                                            result.gaslighting_level === "Extrem" || result.gaslighting_level === "Hoch"
                                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                                : result.gaslighting_level === "Mittel"
                                                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                                : "bg-green-500/10 text-green-400 border border-green-500/20"
                                        }`}>
                                            {result.gaslighting_level}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {result.oma_sprichwort && (
                                <div className="mt-4 pt-4 border-t border-slate-850 italic text-slate-300 text-sm flex items-start gap-2 bg-purple-950/10 p-3 rounded-lg border border-purple-900/20">
                                    <span className="text-xl leading-none text-purple-400">“</span>
                                    <div>
                                        <p className="font-serif text-slate-300 leading-relaxed">"{result.oma_sprichwort}"</p>
                                        <span className="text-[10px] text-purple-400 tracking-wider font-semibold block mt-1 uppercase">Omas Weisheit</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Vorschläge zur Gegenrede / Abgrenzung */}
                        {result.gegenrede_tipps && result.gegenrede_tipps.length > 0 && (
                            <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800/60">
                                <h3 className="font-bold text-white text-md mb-2 flex items-center gap-2">
                                    <span className="text-xl">🛡️</span> Abgrenzung & Gegenrede
                                </h3>
                                <p className="text-slate-400 text-xs mb-4">
                                    Sätze, mit denen du dich klar abgrenzt, ohne neues Futter für Machtspiele zu liefern (Grey Rocking):
                                </p>
                                <div className="space-y-2.5">
                                    {result.gegenrede_tipps.map((sentence, idx) => (
                                        <div 
                                            key={idx} 
                                            className="group/item flex items-center justify-between gap-3 bg-slate-950/20 hover:bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/85 hover:border-purple-900/40 transition-all"
                                        >
                                            <p className="text-xs text-slate-200 italic leading-relaxed">"{sentence}"</p>
                                            <button 
                                                onClick={() => handleCopy(sentence, idx)}
                                                className={`text-[10px] px-2.5 py-1 rounded transition-all font-semibold pointer-events-auto ${copiedIndex === idx ? "bg-purple-500 text-white" : "bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-white"}`}
                                            >
                                                {copiedIndex === idx ? "Kopiert!" : "Kopieren"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
                <OmaChat result={result} />
            </Card>

            {isPrintModalOpen && <PrintPreviewModal result={result} onClose={() => setIsPrintModalOpen(false)} />}
        </div>
    );
};

export default AnalysisDisplay;
