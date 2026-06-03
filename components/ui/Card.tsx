
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md' }) => {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div className={`bg-slate-900/50 backdrop-blur-md border border-slate-800/50 rounded-lg shadow-lg ${paddingClasses[padding]} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
