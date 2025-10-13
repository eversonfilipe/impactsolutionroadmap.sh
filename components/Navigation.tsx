import React from 'react';
import { AppView } from '../App';
import { HistoryIcon } from './icons/HistoryIcon';
import { RoadmapIcon } from './icons/RoadmapIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { KnowledgeIcon } from './icons/KnowledgeIcon';
import { ComplianceIcon } from './icons/ComplianceIcon';

interface NavigationProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  onToggleHistory: () => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 sm:flex-none flex sm:flex-row flex-col items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-brand-accent text-white'
        : 'bg-brand-secondary hover:bg-brand-border text-brand-text-secondary'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    <span>{label}</span>
  </button>
);

/**
 * The main navigation component for the application.
 * Renders tabs to switch between the different feature views.
 */
const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView, onToggleHistory }) => {
  return (
    <div className="bg-brand-secondary p-2 rounded-lg border border-brand-border flex flex-col sm:flex-row justify-between items-center gap-2">
      <div className="w-full sm:w-auto flex flex-row gap-2">
        <NavButton
          label="Roadmap Generator"
          icon={<RoadmapIcon className="w-5 h-5" />}
          isActive={activeView === 'roadmap'}
          onClick={() => setActiveView('roadmap')}
        />
        <NavButton
          label="Analytics Hub"
          icon={<AnalyticsIcon className="w-5 h-5" />}
          isActive={activeView === 'analytics'}
          onClick={() => setActiveView('analytics')}
        />
        <NavButton
          label="Knowledge Base"
          icon={<KnowledgeIcon className="w-5 h-5" />}
          isActive={activeView === 'knowledge'}
          onClick={() => setActiveView('knowledge')}
        />
        <NavButton
          label="Compliance Engine"
          icon={<ComplianceIcon className="w-5 h-5" />}
          isActive={activeView === 'compliance'}
          onClick={() => setActiveView('compliance')}
        />
      </div>
      <button
        onClick={onToggleHistory}
        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 bg-brand-secondary hover:bg-brand-border text-brand-text-secondary"
        title="View History"
        aria-label="Toggle roadmap history panel"
      >
        <HistoryIcon className="w-5 h-5" />
        <span className="">History</span>
      </button>
    </div>
  );
};

export default Navigation;
