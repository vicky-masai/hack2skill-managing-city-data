import React from 'react';
import { RouteAnalysis, Incident, Route } from '../types';
import { MapIcon, ClockIcon, RouteIcon as DistanceIcon, UsersIcon, AlertTriangleIcon, ThumbsUpIcon } from './icons/Icons';

const getTrafficColor = (condition: 'Light' | 'Moderate' | 'Heavy') => {
  switch (condition) {
    case 'Light': return 'border-green-500';
    case 'Moderate': return 'border-yellow-500';
    case 'Heavy': return 'border-red-500';
    default: return 'border-gray-500';
  }
};

const getSeverityColor = (severity: 'Low' | 'Medium' | 'High') => {
  switch (severity) {
    case 'Low': return 'bg-yellow-500/20 text-yellow-300';
    case 'Medium': return 'bg-orange-500/20 text-orange-300';
    case 'High': return 'bg-red-500/20 text-red-300';
    default: return 'bg-gray-500/20 text-gray-300';
  }
};

const IncidentPill: React.FC<{ incident: Incident }> = ({ incident }) => (
  <div className={`group relative flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
    <AlertTriangleIcon className="w-3 h-3 mr-1.5" />
    {incident.type}
    <div className="absolute bottom-full mb-2 w-48 p-2 text-sm bg-gray-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg">
      <p className="font-bold">{incident.type} ({incident.severity})</p>
      <p>{incident.description}</p>
    </div>
  </div>
);

const RouteCard: React.FC<{ route: Route, isBest: boolean }> = ({ route, isBest }) => (
  <div className={`bg-gray-800/60 rounded-xl overflow-hidden border-2 ${isBest ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' : 'border-gray-700/50'}`}>
    <div className={`p-4 border-l-8 ${getTrafficColor(route.trafficCondition)}`}>
      <h3 className="text-lg font-bold text-white flex justify-between items-center">
        {route.routeName}
        {isBest && <span className="text-xs font-bold px-2 py-1 bg-indigo-600 text-white rounded-full flex items-center"><ThumbsUpIcon className="w-4 h-4 mr-1"/> BEST ROUTE</span>}
      </h3>
      <p className="text-sm text-gray-400 mt-1">{route.summary}</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
        <div className="flex items-center"><ClockIcon className="w-4 h-4 mr-2 text-gray-400"/> {route.travelTime}</div>
        <div className="flex items-center"><DistanceIcon className="w-4 h-4 mr-2 text-gray-400"/> {route.distance}</div>
        <div className="flex items-center"><UsersIcon className="w-4 h-4 mr-2 text-gray-400"/> ~{route.vehicleCount} vehicles</div>
        <div className="flex items-center"><AlertTriangleIcon className="w-4 h-4 mr-2 text-gray-400"/> {route.congestionLength} jam</div>
      </div>
      
      {route.incidents.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Incidents on this route:</h4>
          <div className="flex flex-wrap gap-2">
            {route.incidents.map((incident, index) => <IncidentPill key={index} incident={incident} />)}
          </div>
        </div>
      )}
    </div>
  </div>
);

const SkeletonLoader: React.FC = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800/60 rounded-xl p-4 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
                <div className="grid grid-cols-4 gap-4">
                    <div className="h-5 bg-gray-700 rounded w-full"></div>
                    <div className="h-5 bg-gray-700 rounded w-full"></div>
                    <div className="h-5 bg-gray-700 rounded w-full"></div>
                    <div className="h-5 bg-gray-700 rounded w-full"></div>
                </div>
            </div>
        ))}
    </div>
);

const RouteVisualizer: React.FC<{ analysis: RouteAnalysis | null; isLoading: boolean }> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return <SkeletonLoader />;
  }
  
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
        <MapIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-300">Ready to Analyze Your Route</h2>
        <p className="text-gray-500 mt-2">Enter your start and end points above to see AI-powered route suggestions.</p>
      </div>
    );
  }

  if (!analysis.routes || analysis.routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
        <MapIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-300">No Routes Found</h2>
        <p className="text-gray-500 mt-2">The AI could not find any routes for the specified locations. Please try again.</p>
      </div>
    );
  }

  const bestRoute = analysis.routes.reduce((prev, current) => (prev.recommendationScore > current.recommendationScore) ? prev : current);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Route Analysis Results</h2>
      {analysis.routes.sort((a,b) => b.recommendationScore - a.recommendationScore).map((route, index) => (
        <RouteCard key={index} route={route} isBest={route.routeName === bestRoute.routeName} />
      ))}
    </div>
  );
};

export default RouteVisualizer;