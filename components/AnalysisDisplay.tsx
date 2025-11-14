
import React from 'react';
import { AnalysisResult, AnalysisSection } from '../types';

interface AnalysisDisplayProps {
    result: AnalysisResult;
}

const renderContent = (content: string[]) => {
    // Basic check if it looks like a code block
    if (content.length === 1 && (content[0].includes(';') || content[0].includes('{') || content[0].startsWith(' '))) {
         return <pre className="bg-slate-900/70 text-slate-300 rounded p-4 font-mono text-sm border border-slate-600 whitespace-pre-wrap"><code>{content[0]}</code></pre>
    }
    
    // Check for inline code snippets
     const renderWithCode = (text: string) => {
        const parts = text.split(/(`[^`]+`)/g);
        return parts.map((part, i) => {
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code key={i} className="bg-slate-900/70 text-cyan-300 rounded px-1.5 py-1 font-mono text-sm border border-slate-600">
                        {part.slice(1, -1)}
                    </code>
                );
            }
            return part;
        });
    };

    if (content.length === 1) {
        return <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{renderWithCode(content[0])}</p>
    }

    return (
        <ul className="space-y-2 text-slate-300 list-disc list-inside">
            {content.map((item, index) => (
                <li key={index} className="leading-relaxed">
                   {renderWithCode(item)}
                </li>
            ))}
        </ul>
    )
};


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
    return (
        <div className="bg-slate-800/50 p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-lg animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-indigo-400">{result.title}</h2>
            <div className="space-y-8">
                {result.sections.map((section, index) => (
                     <div key={index}>
                        <h3 className="text-xl font-semibold mb-3 text-cyan-400 border-b-2 border-cyan-400/20 pb-2">{section.title}</h3>
                        {renderContent(section.content)}
                    </div>
                ))}
               
                <div>
                    <h3 className="text-xl font-semibold mb-3 text-cyan-400 border-b-2 border-cyan-400/20 pb-2">Action Plan & Next Steps</h3>
                    <ul className="space-y-3 text-slate-300">
                        {result.nextSteps.map((step, index) => (
                           <li key={index} className="flex items-start">
                                <span className="mr-3 mt-2 flex-shrink-0 h-2 w-2 rounded-full bg-cyan-400"></span>
                                <span className="leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AnalysisDisplay;
