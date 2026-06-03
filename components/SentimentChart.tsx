
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { SentimentPoint } from '../types';

interface SentimentChartProps {
    data: SentimentPoint[];
}

const SentimentChart: React.FC<SentimentChartProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                    dataKey="label" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false}
                />
                <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderColor: '#334155', 
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#f1f5f9'
                    }}
                    itemStyle={{ color: '#ef4444' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    strokeWidth={2}
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default SentimentChart;
