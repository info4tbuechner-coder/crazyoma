
import React from 'react';
import { InfoIcon } from './ui/Icons';
import { useAuth } from '../AuthContext';

interface HeaderProps {
    onHelpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHelpClick }) => {
    const { logout } = useAuth();

    return (
        <header className="bg-slate-950/50 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                         <div className="relative flex items-center justify-center w-8 h-8 mr-3 text-xl font-serif text-white rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                            O
                        </div>
                        <h1 className="text-xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Crazy Oma
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onHelpClick} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <InfoIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Was sind narzisstische Muster?</span>
                        </button>
                        <button onClick={logout} className="text-sm font-medium text-slate-400 hover:text-white transition-colors border border-slate-700 rounded-md px-3 py-1.5 hover:bg-slate-800">
                            Abmelden
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
