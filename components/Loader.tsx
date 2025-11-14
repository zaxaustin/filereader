
import React, { useState, useEffect } from 'react';
import SparkleIcon from './icons/SparkleIcon';

const loadingMessages = [
    "Gemini is analyzing your files...",
    "Identifying key insights...",
    "Formulating your action plan...",
    "Checking for actionable dates...",
    "Putting everything together..."
];

const Loader: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center bg-slate-800/50 p-10 rounded-2xl border border-slate-700 shadow-lg">
            <SparkleIcon className="w-12 h-12 text-indigo-400 animate-pulse" />
            <p className="mt-4 text-xl text-slate-300 font-semibold transition-opacity duration-500">
                {loadingMessages[messageIndex]}
            </p>
        </div>
    );
};

export default Loader;
