import React, { useState, useEffect } from 'react';
import { BrainIcon } from './icons';

const TIPS = [
    "Tip: A good introduction sets the context and presents your argument.",
    "Tip: Ensure every paragraph addresses a single, clear idea.",
    "Tip: Use specific examples and data to substantiate your points.",
    "Tip: A strong conclusion should summarize and offer a forward-looking perspective.",
    "Tip: Adhering to the word limit is crucial for time management.",
];

interface LoadingIndicatorProps {
    stage: 'transcribing' | 'grading';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ stage }) => {
    const [tip, setTip] = useState(TIPS[0]);

    useEffect(() => {
        let index = 0;
        const intervalId = setInterval(() => {
            index = (index + 1) % TIPS.length;
            setTip(TIPS[index]);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    const title = stage === 'transcribing' ? "AI is transcribing your answer..." : "AI is evaluating your answer...";
    const subtitle = stage === 'transcribing' ? "This may take a moment." : "This may take 30-60 seconds.";


    return (
        <div className="flex flex-col items-center justify-center text-center p-8 transition-all duration-500 animate-fadeIn">
            <div className="relative w-20 h-20 mb-6">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <BrainIcon className="w-10 h-10 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-6 text-xl font-semibold text-slate-800">{title}</p>
            <p className="mt-2 text-base text-slate-500">{subtitle}</p>
            <div className="mt-8 max-w-md mx-auto text-sm text-gray-500 h-10">
                <p className="transition-opacity duration-500">{tip}</p>
            </div>
        </div>
    );
};