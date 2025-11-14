
import React, { useState } from 'react';
import { AnalysisGoal } from '../types';
import SparkleIcon from './icons/SparkleIcon';
import RocketIcon from './icons/RocketIcon';
import CodeIcon from './icons/CodeIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import OrganizeIcon from './icons/OrganizeIcon';

interface AnalysisConfigurationProps {
  onStartAnalysis: (goal: AnalysisGoal) => void;
}

const analysisGoals = [
  {
    id: 'project-kickstart',
    title: 'Project Kickstart',
    description: 'Generate a project plan, folder structure, and initial tasks from notes and code.',
    icon: RocketIcon,
  },
  {
    id: 'code-review',
    title: 'Code Review & Refactor',
    description: 'Analyze source code for quality, find potential bugs, and suggest improvements.',
    icon: CodeIcon,
  },
  {
    id: 'meeting-summary',
    title: 'Meeting Summary',
    description: 'Distill notes or transcripts into key points, decisions, and action items.',
    icon: ClipboardListIcon,
  },
  {
    id: 'general-organization',
    title: 'General Organization',
    description: 'Sort a mix of files, get a summary, and create a simple to-do list.',
    icon: OrganizeIcon,
  },
] as const;

const AnalysisConfiguration: React.FC<AnalysisConfigurationProps> = ({ onStartAnalysis }) => {
  const [selectedGoal, setSelectedGoal] = useState<AnalysisGoal | null>(null);

  return (
    <div className="pt-6 border-t border-slate-700 animate-fade-in">
      <h3 className="text-xl font-semibold text-center mb-1 text-slate-200">What is your goal?</h3>
      <p className="text-slate-400 text-center mb-6">Select an analysis type to get the most relevant results.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {analysisGoals.map((goal) => {
          const isSelected = selectedGoal === goal.id;
          return (
            <button
              key={goal.id}
              onClick={() => setSelectedGoal(goal.id)}
              className={`text-left p-4 rounded-lg border-2 transition-all duration-200 transform hover:-translate-y-1 ${
                isSelected
                  ? 'bg-indigo-600/30 border-indigo-500 shadow-lg'
                  : 'bg-slate-800 border-slate-700 hover:border-indigo-600'
              }`}
            >
              <div className="flex items-center mb-2">
                <goal.icon className={`w-6 h-6 mr-3 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                <h4 className="font-bold text-lg text-slate-100">{goal.title}</h4>
              </div>
              <p className="text-sm text-slate-400">{goal.description}</p>
            </button>
          );
        })}
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={() => selectedGoal && onStartAnalysis(selectedGoal)}
          disabled={!selectedGoal}
          className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105"
        >
          <SparkleIcon className="w-5 h-5" />
          <span>Start Analysis</span>
        </button>
      </div>
    </div>
  );
};

export default AnalysisConfiguration;
