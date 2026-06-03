
import React from 'react';
import Card from './ui/Card';
import LoadingSpinner from './LoadingSpinner';

const ShimmerLine: React.FC<{ width: string, height?: string }> = ({ width, height = 'h-4' }) => (
    <div className={`bg-slate-700 rounded ${width} ${height}`}></div>
);

const ResultsSkeleton: React.FC = () => {
    return (
        <div className="relative">
            <Card padding="lg">
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
                <div className="space-y-10 blur-sm animate-pulse">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <ShimmerLine width="w-64" height="h-8" />
                            <ShimmerLine width="w-48 mt-2" height="h-4" />
                        </div>
                        <ShimmerLine width="w-32" height="h-8" />
                    </div>

                    {/* Score section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <div className="md:col-span-1 flex justify-center">
                            <div className="w-48 h-48 bg-slate-700 rounded-full"></div>
                        </div>
                        <div className="md:col-span-2 space-y-3">
                            <ShimmerLine width="w-40" height="h-6" />
                            <ShimmerLine width="w-full" />
                            <ShimmerLine width="w-5/6" />
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div>
                         <ShimmerLine width="w-56" height="h-6" />
                         <div className="w-full h-64 bg-slate-700 rounded-lg mt-4"></div>
                    </div>

                    {/* Cards section */}
                    <div>
                        <ShimmerLine width="w-64" height="h-6" />
                        <div className="mt-4 p-4 border border-slate-800 rounded-lg space-y-3">
                            <ShimmerLine width="w-1/3" />
                            <ShimmerLine width="w-full" />
                            <ShimmerLine width="w-3/4" />
                        </div>
                         <div className="mt-4 p-4 border border-slate-800 rounded-lg space-y-3">
                            <ShimmerLine width="w-1/3" />
                            <ShimmerLine width="w-full" />
                            <ShimmerLine width="w-3/4" />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ResultsSkeleton;