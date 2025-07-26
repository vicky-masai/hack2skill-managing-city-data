
import React from 'react';
import { HistoryItem } from '../types';
import { PlusIcon, ArrowRightIcon } from './icons';
import { useAppContext } from '../hooks/useAppContext';

interface HistorySidebarProps {
  onSelectHistory: (id: string) => void;
  activeHistoryId: string | null;
  onNewAnalysis: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ onSelectHistory, activeHistoryId, onNewAnalysis }) => {
  const { history } = useAppContext();
  
  return (
    <div className="w-80 bg-brand-bg-light flex-shrink-0 flex flex-col h-full border-r border-gray-700/50">
      <div className="p-4 border-b border-gray-700/50">
        <h2 className="text-2xl font-bold text-white">Bengaluru Pulse</h2>
        <p className="text-sm text-brand-text-secondary">Your City, Synthesized</p>
      </div>
      <div className="p-4">
        <button 
          onClick={onNewAnalysis}
          className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-500 transition-colors duration-300"
        >
          <PlusIcon />
          New Analysis
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-10 px-4">
                <p className="text-brand-text-secondary">Your route analyses will appear here.</p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectHistory(item.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                  activeHistoryId === item.id ? 'bg-brand-primary/20 text-brand-text-primary' : 'hover:bg-brand-surface text-brand-text-secondary'
                }`}
              >
                <div className="font-semibold text-sm truncate text-brand-text-primary">{item.from} to {item.to}</div>
                <div className="text-xs mt-1">{item.timestamp.toLocaleTimeString()}</div>
              </button>
            ))
          )}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-500">Powered by Google Gemini</p>
      </div>
    </div>
  );
};

export default HistorySidebar;
