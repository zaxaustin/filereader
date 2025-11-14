
import React from 'react';
import { CalendarEvent } from '../types';
import CalendarIcon from './icons/CalendarIcon';

interface CalendarViewProps {
    events: CalendarEvent[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
    return (
        <div className="bg-slate-800/50 p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-lg animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-indigo-400 flex items-center gap-3">
                <CalendarIcon className="w-8 h-8"/>
                Proposed Calendar Events
            </h2>
            {events.length === 0 ? (
                <p className="text-slate-400">No specific events could be scheduled from the action items.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((event, index) => (
                        <div key={index} className="bg-slate-800 p-5 rounded-lg border border-slate-700 hover:border-indigo-500 transition-colors duration-300">
                            <p className="font-bold text-lg text-indigo-300">{event.title}</p>
                            <div className="text-sm text-slate-400 mt-2 mb-3">
                                <p><span className='font-semibold'>Date:</span> {event.date}</p>
                                <p><span className='font-semibold'>Time:</span> {event.time}</p>
                            </div>
                            <p className="text-slate-300 text-base">{event.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CalendarView;
