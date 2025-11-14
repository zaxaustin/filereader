
import React, { useState, useCallback } from 'react';
import { UploadedFile, AnalysisResult, CalendarEvent, AnalysisGoal } from './types';
import { analyzeFiles, generateCalendarEvents } from './services/geminiService';

import FileUpload from './components/FileUpload';
import AnalysisConfiguration from './components/AnalysisConfiguration';
import AnalysisDisplay from './components/AnalysisDisplay';
import CalendarView from './components/CalendarView';
import Loader from './components/Loader';
import SparkleIcon from './components/icons/SparkleIcon';

type AppState = 'upload' | 'configure' | 'loading' | 'results';

const App: React.FC = () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [appState, setAppState] = useState<AppState>('upload');
    const [error, setError] = useState<string | null>(null);

    const handleFilesChange = useCallback((uploadedFiles: UploadedFile[]) => {
        setFiles(uploadedFiles);
        setAnalysisResult(null);
        setCalendarEvents([]);
        setError(null);
        setAppState(uploadedFiles.length > 0 ? 'configure' : 'upload');
    }, []);

    const handleAnalyze = async (goal: AnalysisGoal) => {
        if (files.length === 0) {
            setError("Please upload at least one file to analyze.");
            return;
        }
        setAppState('loading');
        setError(null);
        try {
            const analysis = await analyzeFiles(files, goal);
            setAnalysisResult(analysis);

            if (analysis.nextSteps && analysis.nextSteps.length > 0) {
                const events = await generateCalendarEvents(analysis.nextSteps);
                setCalendarEvents(events);
            }
            setAppState('results');
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
            setAppState('configure'); // Go back to config on error
        }
    };
    
    const handleReset = () => {
        setFiles([]);
        setAnalysisResult(null);
        setCalendarEvents([]);
        setError(null);
        setAppState('upload');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-5xl mx-auto">
                <header className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <SparkleIcon className="w-8 h-8 text-indigo-400" />
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                            Gemini File Organizer
                        </h1>
                    </div>
                    <p className="text-slate-400 text-lg">
                        Upload your files, choose your goal, and let Gemini do the heavy lifting.
                    </p>
                </header>

                <main className="space-y-8">
                    {appState === 'loading' && <Loader />}
                    
                    {appState === 'results' && analysisResult && (
                        <div className='flex flex-col gap-8'>
                             <AnalysisDisplay result={analysisResult} />
                             {calendarEvents.length > 0 && <CalendarView events={calendarEvents} />}
                             <div className="text-center">
                                <button
                                    onClick={handleReset}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
                                >
                                    Analyze New Files
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {(appState === 'upload' || appState === 'configure') && (
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg space-y-6">
                            <FileUpload onFilesChange={handleFilesChange} />
                            {appState === 'configure' && (
                                <AnalysisConfiguration onStartAnalysis={handleAnalyze} />
                            )}
                            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                        </div>
                    )}
                </main>
                
                <footer className="text-center mt-12 text-slate-500">
                    <p>Powered by Google Gemini</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
