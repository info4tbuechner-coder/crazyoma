import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { NarcissisticPattern } from '../types';

interface PatternDistributionChartProps {
    patterns: NarcissisticPattern[];
}

const PatternDistributionChart: React.FC<PatternDistributionChartProps> = ({ patterns }) => {
    // FIX: Explicitly type the accumulator in the reduce function to prevent type inference issues.
    const patternCounts = patterns.reduce((acc: Record<string, number>, pattern) => {
        acc[pattern.muster_name] = (acc[pattern.muster_name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(patternCounts)
        // FIX: The `count` from Object.entries can be inferred as `unknown`.
        // Explicitly casting to `number` ensures the sort operation is type-safe.
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count);

    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500 text-sm">Keine Muster für ein Diagramm gefunden.</div>
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80} 
                    tick={{ fill: '#d1d5db', fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    cursor={{fill: 'rgba(168, 85, 247, 0.1)'}}
                    contentStyle={{
                        background: 'rgba(30, 41, 59, 0.9)',
                        borderColor: '#4a044e',
                        color: '#f8fafc',
                        borderRadius: '0.5rem'
                    }}
                    labelStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="url(#colorUv)" radius={[0, 4, 4, 0]}>
                </Bar>
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.8}/>
                    </linearGradient>
                </defs>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default PatternDistributionChart;