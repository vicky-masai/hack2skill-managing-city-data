import React from 'react';
import { ClockIcon, TrendingUpIcon, DropletIcon, CurrencyRupeeIcon, AlertTriangleIcon, CheckCircleIcon } from './icons';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; unit: string }> = ({ icon, title, value, unit }) => (
    <div className="bg-brand-bg-light p-5 rounded-xl shadow-lg flex items-center gap-4">
        <div className="bg-brand-surface p-3 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-brand-text-secondary text-sm">{title}</p>
            <p className="text-2xl font-bold text-brand-text-primary">{value} <span className="text-base font-normal text-brand-text-secondary">{unit}</span></p>
        </div>
    </div>
);

type IncidentStatus = 'Done' | 'In Progress' | 'Reported';

interface Incident {
    issue: string;
    status: IncidentStatus;
    date: string;
}

const IncidentItem: React.FC<Incident> = ({ issue, status, date }) => {
    const statusConfig = {
        'Done': { icon: <CheckCircleIcon className="text-status-green" />, color: 'text-status-green' },
        'In Progress': { icon: <ClockIcon className="text-status-yellow" />, color: 'text-status-yellow' },
        'Reported': { icon: <AlertTriangleIcon className="text-status-blue" />, color: 'text-status-blue' },
    };
    return (
        <li className="flex items-center justify-between py-3">
            <div>
                <p className="font-medium">{issue}</p>
                <p className="text-sm text-brand-text-secondary">{date}</p>
            </div>
            <div className={`flex items-center gap-2 text-sm font-semibold ${statusConfig[status].color}`}>
                {statusConfig[status].icon}
                <span>{status}</span>
            </div>
        </li>
    );
};


function Dashboard() {
  // All data is mocked for demonstration purposes
  const stats = [
    { icon: <ClockIcon className="text-blue-400" />, title: "Total Travel Time (This Month)", value: "32", unit: "hours" },
    { icon: <TrendingUpIcon className="text-green-400" />, title: "Total Distance Covered", value: "480", unit: "km" },
    { icon: <DropletIcon className="text-orange-400" />, title: "Estimated Fuel Used", value: "35.2", unit: "liters" },
    { icon: <CurrencyRupeeIcon className="text-purple-400" />, title: "Total Fuel Spending", value: "3,700", unit: "INR" }
  ];

  const incidents: Incident[] = [
    { issue: "Pothole on 80ft Road", status: 'Done', date: "Reported 2 weeks ago" },
    { issue: "Broken Streetlight", status: 'In Progress', date: "Reported 3 days ago" },
    { issue: "Frequent traffic jam at Sony World Signal", status: 'Reported', date: "Analytics ongoing" }
  ];

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-brand-text-primary">Personal Dashboard</h1>
            <p className="text-brand-text-secondary mt-1">Your synthesized travel and incident summary.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
        </div>

        <div className="bg-brand-bg-light p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Incidents on Your Regular Routes</h2>
            <ul className="divide-y divide-gray-700">
                {incidents.map(inc => <IncidentItem key={inc.issue} {...inc} />)}
            </ul>
        </div>

        <div className="bg-brand-bg-light p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Feature Spotlight: Public Sentiment</h2>
            <p className="text-brand-text-secondary mb-4">Coming soon: A "mood map" analyzing public sentiment from posts to visualize how different areas of the city are feeling about events, traffic, and civic issues.</p>
            <div className="h-40 bg-brand-surface rounded-lg flex items-center justify-center">
                <p className="text-brand-text-secondary">Sentiment Analysis Visualization Placeholder</p>
            </div>
        </div>
    </div>
  );
}

export default Dashboard;