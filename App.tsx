
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { analyzeConversation } from './services/geminiService';
import { useAuth } from './AuthContext';
import { useAnalysisHistory } from './hooks/useAnalysisHistory';
import { AnalysisResult } from './types';

import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import ConversationInput from './components/ConversationInput';
import AnalysisDisplay from './components/AnalysisDisplay';
import HistorySidebar from './components/HistorySidebar';
import { HistoryIcon } from './components/ui/Icons';

const HelpPage = lazy(() => import('./components/HelpPage'));

type AnalysisState = {
    status: 'idle' | 'loading' | 'success' | 'error';
    data: AnalysisResult | null;
    error: string | null;
};

const App: React.FC = () => {
    const { user, loading, isConfigured } = useAuth();
    const [showSplash, setShowSplash] = useState(true);
    
    const [analysisState, setAnalysisState] = useState<AnalysisState>({
        status: 'idle',
        data: null,
        error: null,
    });

    const { addAnalysis } = useAnalysisHistory();
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'main' | 'help'>('main');

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleAnalyze = useCallback(async (conversation: string, context: string, imageBase64?: string) => {
        if (!conversation.trim() && !imageBase64) {
            setAnalysisState({ status: 'error', data: null, error: "Oma braucht Futter, mein Kind. Text oder Bild bitte!" });
            return;
        }
        setAnalysisState({ status: 'loading', data: null, error: null });
        try {
            const result = await analyzeConversation(conversation, context, imageBase64);
            setAnalysisState({ status: 'success', data: result, error: null });
            addAnalysis(result);
        } catch (err: any) {
            console.error("Analyse fehlgeschlagen:", err);
            const errMsg = err?.message || "Omas Brille ist beschlagen. Versuch's nochmal!";
            setAnalysisState({ status: 'error', data: null, error: errMsg });
        }
    }, [addAnalysis]);

    const handleLoadAnalysis = (result: AnalysisResult) => {
        setAnalysisState({ status: 'success', data: result, error: null });
        setIsHistoryOpen(false);
    };

    if (showSplash || loading) return <SplashScreen />;

    if (!user) return <LoginScreen onLoginSuccess={() => {}} />;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-purple-500/30">
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
            </div>

            <Header onHelpClick={() => setCurrentView('help')} />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {currentView === 'main' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                            <ConversationInput onAnalyze={handleAnalyze} isLoading={analysisState.status === 'loading'} />
                        </div>
                        <div className="lg:col-span-7 xl:col-span-8">
                            <AnalysisDisplay state={analysisState} />
                        </div>
                    </div>
                ) : (
                    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>}>
                        <div className="animate-fade-in max-w-4xl mx-auto">
                            <button onClick={() => setCurrentView('main')} className="mb-6 flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                Zurück zur Analyse
                            </button>
                            <HelpPage />
                        </div>
                    </Suspense>
                )}
            </main>

            <button
                onClick={() => setIsHistoryOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 group"
                aria-label="Verlauf"
            >
                <HistoryIcon className="h-6 w-6" />
                <span className="absolute right-full mr-3 bg-slate-900 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">Verlauf anzeigen</span>
            </button>
            
            <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} onLoadAnalysis={handleLoadAnalysis} />
        </div>
    );
};

export default App;
