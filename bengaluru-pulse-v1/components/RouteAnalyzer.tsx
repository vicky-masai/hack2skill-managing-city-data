
import React, { useState, useEffect, useCallback } from 'react';
import { Route } from '../types';
import { analyzeRoutes } from '../services/geminiService';
import RouteCard from './RouteCard';
import Spinner from './Spinner';
import { SearchIcon } from './icons';
import IncidentReporter from './IncidentReporter';
import { useAppContext } from '../hooks/useAppContext';


function RouteAnalyzer() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReporterOpen, setIsReporterOpen] = useState(false);

  const { addHistoryItem, activeItem } = useAppContext();

  useEffect(() => {
    if (activeItem) {
      setFrom(activeItem.from);
      setTo(activeItem.to);
      setRoutes(activeItem.routes);
      setIsLoading(false);
      setError(null);
    } else {
      setFrom('Koramangala');
      setTo('Indiranagar');
      setRoutes([]);
      setError(null);
    }
  }, [activeItem]);

  const handleAnalyze = useCallback(async () => {
    if (!from || !to) {
      setError('Please enter both a starting point and a destination.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRoutes([]);

    try {
      const result = await analyzeRoutes(from, to);
      setRoutes(result);
      addHistoryItem({ from, to, routes: result, timestamp: new Date() });
    } catch (err) {
      console.error('Error analyzing routes:', err);
      setError('Failed to analyze routes. The AI agent might be busy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [from, to, addHistoryItem]);

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="bg-brand-bg-light p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-brand-text-primary mb-2">Bengaluru Route Intelligence</h1>
        <p className="text-brand-text-secondary mb-6">Enter your route to get AI-powered traffic synthesis and predictive analysis.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label htmlFor="from" className="block text-sm font-medium text-brand-text-secondary mb-1">From</label>
            <input
              id="from"
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="e.g., Koramangala"
              className="w-full bg-brand-surface border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
            />
          </div>
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-brand-text-secondary mb-1">To</label>
            <input
              id="to"
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="e.g., Indiranagar"
              className="w-full bg-brand-surface border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !from || !to}
              className="w-full sm:w-auto flex-grow flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              <SearchIcon />
              {isLoading ? 'Analyzing...' : 'Analyze Routes'}
            </button>
            <button
                onClick={() => setIsReporterOpen(true)}
                className="w-full sm:w-auto bg-brand-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-green-500 transition-colors duration-300"
            >
                Report an Incident
            </button>
        </div>
        {error && <p className="text-status-red mt-4 text-center">{error}</p>}
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <Spinner />
          <p className="mt-4 text-brand-text-secondary">Our AI agent is analyzing real-time city data...</p>
        </div>
      )}

      {routes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Suggested Routes</h2>
          <div className="space-y-6">
            {routes.map((route, index) => (
              <RouteCard key={index} route={route} />
            ))}
          </div>
        </div>
      )}
      
      <IncidentReporter isOpen={isReporterOpen} onClose={() => setIsReporterOpen(false)} />
    </div>
  );
}

export default RouteAnalyzer;
