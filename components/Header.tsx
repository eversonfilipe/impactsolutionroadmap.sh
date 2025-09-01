import React from 'react';
import { GithubIcon } from './icons/GithubIcon';
import { HistoryIcon } from './icons/HistoryIcon';

/**
 * Props for the Header component.
 */
interface HeaderProps {
    /** Callback function to toggle the visibility of the HistoryPanel. */
    onToggleHistory: () => void;
}

/**
 * The main header component for the application.
 * It displays the project title and provides navigation controls like
 * opening the history panel and linking to the GitHub repository.
 */
const Header: React.FC<HeaderProps> = ({ onToggleHistory }) => {
  return (
    <header className="bg-brand-secondary border-b border-brand-border p-4 sticky top-0 z-20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
           <span className="text-xl font-bold tracking-wider">ImpactSolutionRoadmap.sh</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onToggleHistory}
            className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 bg-brand-secondary hover:bg-brand-border text-brand-text-secondary"
            title="View History"
            aria-label="Toggle roadmap history panel"
          >
            <HistoryIcon className="w-5 h-5" />
            <span className="hidden sm:inline">History</span>
          </button>
           <a href="https://github.com/your-repo/impactsolutionroadmap" target="_blank" rel="noopener noreferrer" className="text-brand-text-secondary hover:text-brand-text-primary transition-colors" title="View on GitHub">
              <GithubIcon className="w-6 h-6" />
           </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
