
import React from 'react';
import { View } from '../types';
import { LayoutDashboardIcon, RouteIcon } from './icons';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
      isActive
        ? 'bg-brand-primary text-white'
        : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text-primary'
    }`}
  >
    {icon}
    {label}
  </button>
);


const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  return (
    <header className="flex-shrink-0 bg-brand-bg-light/80 backdrop-blur-md border-b border-gray-700/50 px-6 py-3">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 p-1 bg-brand-surface rounded-lg">
          <NavButton 
            label="Route Analyzer"
            icon={<RouteIcon />}
            isActive={activeView === View.ANALYZER}
            onClick={() => setActiveView(View.ANALYZER)}
          />
          <NavButton 
            label="Dashboard"
            icon={<LayoutDashboardIcon />}
            isActive={activeView === View.DASHBOARD}
            onClick={() => setActiveView(View.DASHBOARD)}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
