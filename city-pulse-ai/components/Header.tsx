
import React from 'react';
import { BotMessageSquareIcon } from './icons/Icons';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-600 rounded-lg">
          <BotMessageSquareIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">City Pulse AI</h1>
          <p className="text-sm text-gray-400">Your live, intelligent view of the city</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
