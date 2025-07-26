
import React from 'react';
import { HistoryIcon, MapPinIcon } from './icons/Icons';

interface TravelHistoryProps {
  history: string[];
  onHistoryClick: (searchKey: string) => void;
}

const TravelHistory: React.FC<TravelHistoryProps> = ({ history, onHistoryClick }) => {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-200 flex items-center mb-4">
        <HistoryIcon className="w-5 h-5 mr-2" />
        Travel History
      </h2>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm mt-2">Your past route searches will appear here.</p>
        ) : (
          history.map((item, index) => (
            <button
              key={index}
              onClick={() => onHistoryClick(item)}
              className="w-full text-left p-2.5 rounded-lg bg-gray-800 hover:bg-indigo-600/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">{item}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default TravelHistory;
