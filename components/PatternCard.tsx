import React from 'react';
import type { NarcissisticPattern } from '../types';
import { LightBulbIcon } from './ui/Icons';

interface PatternCardProps {
    pattern: NarcissisticPattern;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern }) => {
    return (
        <div className="bg-slate-800/40 rounded-lg border border-slate-700/60 p-5 transition-all hover:border-purple-400/50 hover:shadow-lg hover:bg-slate-800/60">
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                    <LightBulbIcon className="w-5 h-5"/>
                </div>
                <h4 className="text-md font-semibold text-purple-300">{pattern.muster_name}</h4>
            </div>
            <blockquote className="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-4">
                "{pattern.zitat}"
            </blockquote>
            <div className="text-sm text-slate-300 pl-11">
                <p><span className="font-semibold text-pink-400">Omas Deutung:</span> {pattern.erklaerung}</p>
            </div>
        </div>
    );
};

export default PatternCard;