
import React from 'react';
import { Route } from '../types';
import { ClockIcon, AlertTriangleIcon, SparklesIcon, MapPinIcon } from './icons';

interface RouteCardProps {
  route: Route;
}

const getTrafficColor = (level: 'Low' | 'Medium' | 'High' | 'Severe') => {
  switch (level) {
    case 'Low':
      return 'bg-green-500/20 text-status-green';
    case 'Medium':
      return 'bg-yellow-500/20 text-status-yellow';
    case 'High':
      return 'bg-orange-500/20 text-orange-400';
    case 'Severe':
      return 'bg-red-500/20 text-status-red';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const RouteCard: React.FC<RouteCardProps> = ({ route }) => {
  const trafficClasses = getTrafficColor(route.trafficLevel);

  return (
    <div className="bg-brand-bg-light border border-gray-700/50 rounded-2xl p-6 transition-all duration-300 hover:border-brand-primary/50 hover:shadow-2xl hover:shadow-brand-primary/10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex items-center gap-3">
            <div className="bg-brand-surface p-2 rounded-lg">
                <MapPinIcon />
            </div>
            <h3 className="text-xl font-bold text-brand-text-primary">{route.routeName}</h3>
        </div>
        <div className="flex items-center gap-4 mt-3 sm:mt-0">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${trafficClasses}`}>
            {route.trafficLevel} Traffic
          </span>
          <div className="flex items-center gap-2 text-brand-text-secondary">
            <ClockIcon />
            <span className="font-semibold text-brand-text-primary">{route.travelTime} min</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-5 mt-5 pl-4 border-l-2 border-gray-700">
        <div className="relative">
          <div className="absolute -left-[2.1rem] top-1.5 h-6 w-6 bg-brand-surface rounded-full flex items-center justify-center ring-4 ring-brand-bg-light">
            <AlertTriangleIcon className="h-4 w-4 text-status-yellow" />
          </div>
          <div>
            <h4 className="font-semibold text-brand-text-secondary">Incident Summary</h4>
            <p className="text-brand-text-primary">{route.incidentSummary}</p>
          </div>
        </div>
        <div className="relative">
           <div className="absolute -left-[2.1rem] top-1.5 h-6 w-6 bg-brand-surface rounded-full flex items-center justify-center ring-4 ring-brand-bg-light">
            <SparklesIcon className="h-4 w-4 text-status-blue" />
          </div>
          <div>
            <h4 className="font-semibold text-brand-text-secondary">Predictive Analysis</h4>
            <p className="text-brand-text-primary">{route.prediction}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteCard;
