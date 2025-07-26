
import React from 'react';
import { ClockIcon, RouteIcon, FuelIcon, DollarSignIcon, AlertTriangleIcon } from './icons/Icons';
import { DashboardData } from '../types';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; unit: string }> = ({ icon, title, value, unit }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg flex items-center space-x-4">
    <div className="p-2 bg-gray-700 rounded-md">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-lg font-bold text-white">
        {value} <span className="text-sm font-normal text-gray-400">{unit}</span>
      </p>
    </div>
  </div>
);

const DashboardStats: React.FC<{ stats: DashboardData }> = ({ stats }) => {
  const statsData = [
    { icon: <ClockIcon className="w-6 h-6 text-blue-400" />, title: "Time Saved (This Month)", value: stats.timeSaved.toFixed(1), unit: "hours" },
    { icon: <RouteIcon className="w-6 h-6 text-green-400" />, title: "Distance Travelled", value: stats.distanceTravelled.toLocaleString('en-IN', { maximumFractionDigits: 0 }), unit: "km" },
    { icon: <FuelIcon className="w-6 h-6 text-yellow-400" />, title: "Fuel Saved (Est.)", value: stats.fuelSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 }), unit: "liters" },
    { icon: <DollarSignIcon className="w-6 h-6 text-teal-400" />, title: "Money Saved (Est.)", value: stats.moneySaved.toLocaleString('en-IN', { maximumFractionDigits: 0 }), unit: "INR" },
    { icon: <AlertTriangleIcon className="w-6 h-6 text-red-400" />, title: "Incidents Avoided", value: stats.incidentsAvoided.toLocaleString('en-IN'), unit: "total" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Monthly Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
