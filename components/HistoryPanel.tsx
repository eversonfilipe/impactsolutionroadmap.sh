import React from 'react';
import { Roadmap } from '../types';
import { TrashIcon } from './icons/TrashIcon';

/**
 * Props for the HistoryPanel component.
 */
interface HistoryPanelProps {
  /** An array of saved roadmap objects. */
  history: Roadmap[];
  /** Callback function to load a roadmap from history. */
  onLoad: (id: string) => void;
  /** Callback function to delete a roadmap from history. */
  onDelete: (id: string) => void;
  /** Callback function to close the panel. */
  onClose: () => void;
}

/**
 * A slide-in panel component that displays a list of saved roadmaps.
 * It allows users to load, delete, and manage their roadmap history.
 */
const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoad, onDelete, onClose }) => {
  return (
    // The overlay that covers the page
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-end z-40" onClick={onClose}>
      <div 
        className="w-full max-w-md h-full bg-brand-secondary shadow-2xl flex flex-col border-l border-brand-border animate-slide-in"
        // Stop click propagation to prevent the panel from closing when clicking inside it
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">Roadmap History</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-white text-2xl" aria-label="Close history panel">&times;</button>
        </div>

        {history.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-center p-4">
            <p className="text-brand-text-secondary">No saved roadmaps yet. Generate and save a roadmap to see it here.</p>
          </div>
        ) : (
          <ul className="overflow-y-auto flex-grow">
            {history.map(roadmap => (
              <li key={roadmap.id} className="border-b border-brand-border hover:bg-brand-primary/50 transition-colors">
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onLoad(roadmap.id)}>
                    <p className="font-semibold truncate" title={roadmap.title}>{roadmap.title}</p>
                    <p className="text-xs text-brand-text-secondary">
                      {new Date(roadmap.generatedAt).toLocaleString()}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent the load action from firing
                        if (window.confirm(`Are you sure you want to delete "${roadmap.title}"?`)) {
                            onDelete(roadmap.id);
                        }
                    }}
                    className="ml-4 p-2 text-red-500 hover:bg-red-800/50 rounded-full"
                    title="Delete Roadmap"
                    aria-label={`Delete roadmap titled ${roadmap.title}`}
                  >
                    <TrashIcon className="w-5 h-5"/>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Simple CSS for the slide-in animation */}
      <style>{`
        .animate-slide-in {
            animation: slideInFromRight 0.3s ease-out forwards;
        }
        @keyframes slideInFromRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default HistoryPanel;
