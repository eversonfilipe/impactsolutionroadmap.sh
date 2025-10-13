import React from 'react';
import { GithubIcon } from './icons/GithubIcon';
import { InstallAppIcon } from './icons/InstallAppIcon';

/**
 * Props for the Header component.
 */
interface HeaderProps {
    /** Callback function to trigger the PWA installation prompt. */
    onInstall: () => void;
    /** A boolean to control the visibility of the install button. */
    showInstallButton: boolean;
}

/**
 * The main header component for the application.
 * It displays the project title and provides navigation controls like
 * opening the history panel and linking to the GitHub repository.
 */
const Header: React.FC<HeaderProps> = ({ onInstall, showInstallButton }) => {
  return (
    <header className="bg-brand-secondary border-b border-brand-border p-4 sticky top-0 z-20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
           <span className="text-xl font-bold tracking-wider">ImpactSolutionRoadmap</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {showInstallButton && (
            <button
              onClick={onInstall}
              className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 bg-brand-accent hover:bg-brand-accent-hover text-white"
              title="Install App"
              aria-label="Install application on your device"
            >
              <InstallAppIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}
           <a href="https://github.com/your-repo/impactsolutionroadmap" target="_blank" rel="noopener noreferrer" className="text-brand-text-secondary hover:text-brand-text-primary transition-colors" title="View on GitHub">
              <GithubIcon className="w-6 h-6" />
           </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
