
import React from 'react';

const SplashScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 animate-fade-in">
            <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-50 blur-lg"></div>
                    <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-purple-400"></div>
                     <div className="absolute inset-2 rounded-full animate-pulse-ring" style={{ animationDelay: '0.5s', borderColor: '#ec4899' }}></div>
                    <div className="relative flex items-center justify-center w-full h-full text-5xl font-serif text-white">
                        O
                    </div>
                </div>
                <h1 className="text-4xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    Crazy Oma
                </h1>
                <p className="text-slate-400 mt-2">...schaut mal genauer hin.</p>
            </div>
        </div>
    );
};

export default SplashScreen;
