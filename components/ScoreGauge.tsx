
import React, { useEffect, useState } from 'react';

interface ScoreGaugeProps {
    score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
    const [displayScore, setDisplayScore] = useState(0);
    
    const radius = 85;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayScore / 100) * circumference;

    const scoreColor = score > 75 ? 'text-red-400' : score > 50 ? 'text-orange-400' : score > 25 ? 'text-yellow-400' : 'text-green-400';
    const trackColor = score > 75 ? 'url(#gradient-red)' : score > 50 ? 'url(#gradient-orange)' : score > 25 ? 'url(#gradient-yellow)' : 'url(#gradient-green)';

    useEffect(() => {
        let start = 0;
        const end = score;
        if (start === end) return;

        let totalDuration = 1000; // 1 second
        let startTimestamp: number | null = null;
        
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = timestamp - startTimestamp;
            const nextValue = Math.min(start + (progress / totalDuration) * end, end);
            setDisplayScore(Math.round(nextValue));
            if (nextValue < end) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [score]);


    return (
        <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 200 200">
                <defs>
                    <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                    <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#facc15" />
                        <stop offset="100%" stopColor="#eab308" />
                    </linearGradient>
                    <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                    <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f87171" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                </defs>

                {/* Background track */}
                <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    strokeWidth="15"
                    stroke="rgba(255, 255, 255, 0.1)"
                    fill="transparent"
                />
                {/* Progress track */}
                <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    strokeWidth="15"
                    stroke={trackColor}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
                />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${scoreColor}`}>
                <span className="text-5xl font-bold font-serif">{displayScore}</span>
                <span className="text-sm font-semibold tracking-wider">SCORE</span>
            </div>
        </div>
    );
};

export default ScoreGauge;
