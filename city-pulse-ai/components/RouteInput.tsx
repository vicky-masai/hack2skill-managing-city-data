
import React, { useState } from 'react';
import { MapIcon, Loader2Icon } from './icons/Icons';
import { toast } from 'sonner';

interface RouteInputProps {
  onAnalyze: (from: string, to: string) => void;
  isLoading: boolean;
}

const RouteInput: React.FC<RouteInputProps> = ({ onAnalyze, isLoading }) => {
  const [from, setFrom] = useState('Koramangala');
  const [to, setTo] = useState('Whitefield');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) {
      toast.warning('Please enter both "From" and "To" locations.');
      return;
    }
    onAnalyze(from, to);
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-2/5">
          <label htmlFor="from-location" className="text-sm font-medium text-gray-400">From</label>
          <input
            id="from-location"
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="e.g., Koramangala"
            className="mt-1 w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        <div className="w-full md:w-2/5">
          <label htmlFor="to-location" className="text-sm font-medium text-gray-400">To</label>
          <input
            id="to-location"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="e.g., Whitefield"
            className="mt-1 w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        <div className="w-full md:w-1/5 pt-0 md:pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center p-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isLoading ? (
              <Loader2Icon className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <MapIcon className="w-5 h-5 mr-2" />
                Analyze Routes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RouteInput;
