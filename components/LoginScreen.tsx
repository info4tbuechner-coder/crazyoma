
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import Button from './ui/Button';
import { useLanguage } from '../LanguageContext';

interface LoginScreenProps {
    onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const { loginWithEmailPassword, signUpWithEmailPassword, isConfigured } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);
        try {
            if (isSignUp) {
                await signUpWithEmailPassword(email, password);
            } else {
                await loginWithEmailPassword(email, password);
            }
            onLoginSuccess();
        } catch (err: any) {
            setError(true);
            setErrorMsg(err.message || 'Ein Fehler ist aufgetreten.');
            setTimeout(() => setError(false), 500);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center animate-fade-in p-4">
            <div className={`max-w-md w-full p-8 bg-slate-900/50 backdrop-blur-md border border-slate-800/50 rounded-lg shadow-lg ${error ? 'animate-shake' : ''}`}>
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        {t.loginTitle}
                    </h1>
                    <p className="text-slate-400 mt-2">{t.loginSubtitle}</p>
                    
                    <div className="mt-4 flex justify-center items-center gap-2">
                        <span className="text-xs text-slate-500">{t.languageLabel}</span>
                        <button 
                            onClick={() => setLanguage('de')}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${language === 'de' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >DE</button>
                        <button 
                            onClick={() => setLanguage('ru')}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${language === 'ru' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >RU</button>
                    </div>

                    {!isConfigured && (
                        <div className="mt-3 inline-block bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                            {t.offlineMode}
                        </div>
                    )}
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-400">
                            E-Mail
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="appearance-none block w-full px-3 py-2 border border-slate-700 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-slate-800/50 text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-400">
                            {t.loginPlaceholder}
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="appearance-none block w-full px-3 py-2 border border-slate-700 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-slate-800/50 text-white"
                            />
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="text-red-400 text-sm text-center">
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Lädt...' : (isSignUp ? 'Konto erstellen' : t.loginButton)}
                        </Button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        {isSignUp ? 'Bereits ein Konto? Hier anmelden.' : 'Noch kein Konto? Hier registrieren.'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
