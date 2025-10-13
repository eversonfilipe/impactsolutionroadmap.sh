import React, { useState, useEffect, useCallback } from 'react';
import { Roadmap, RoadmapNode } from './types';
import Header from './components/Header';
import HistoryPanel from './components/HistoryPanel';
import Navigation from './components/Navigation';
import RoadmapGeneratorView from './components/views/RoadmapGeneratorView';
import AnalyticsHubView from './components/views/AnalyticsHubView';
import KnowledgeBaseView from './components/views/KnowledgeBaseView';
import ComplianceEngineView from './components/views/ComplianceEngineView';

/**
 * Defines the available views (main sections) of the application.
 */
export type AppView = 'roadmap' | 'analytics' | 'knowledge' | 'compliance';

/**
 * The key used to store the roadmap history in the browser's local storage.
 */
const LOCAL_STORAGE_HISTORY_KEY = 'impact_roadmaps_history';

/**
 * The main application component. It orchestrates the entire user flow,
 * managing state for the active roadmap, generation process, and user's history,
 * and routing between the different feature views.
 */
const App: React.FC = () => {
  /**
   * State to control which main view is currently displayed.
   */
  const [activeView, setActiveView] = useState<AppView>('roadmap');

  /**
   * State to control the visibility of the roadmap history panel.
   */
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  /**
   * The currently active/displayed roadmap. Null if no roadmap is active.
   */
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  
  /**
   * An array of all roadmaps saved by the user. Persisted to local storage.
   */
  const [roadmapHistory, setRoadmapHistory] = useState<Roadmap[]>([]);
  
  /**
   * State to hold the PWA install prompt event.
   */
  const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null);

  /**
   * Effect to listen for the `beforeinstallprompt` event to enable PWA installation.
   */
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  /**
   * Effect to load the roadmap history from local storage on initial component mount.
   */
  useEffect(() => {
    const storedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (storedHistory) {
      setRoadmapHistory(JSON.parse(storedHistory));
    }
  }, []);

  /**
   * A helper function to update the roadmap history state and persist it to local storage.
   * @param newHistory - The new history array to save.
   */
  const updateHistory = (newHistory: Roadmap[]) => {
    setRoadmapHistory(newHistory);
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(newHistory));
  };

  /**
   * Saves a new roadmap to the history or updates an existing one if it's already saved.
   */
  const handleSaveOrUpdateRoadmap = useCallback(() => {
    if (!activeRoadmap) return;
    const existingIndex = roadmapHistory.findIndex(r => r.id === activeRoadmap.id);
    let newHistory;
    if (existingIndex > -1) {
        // Update the existing roadmap in the history
        newHistory = [...roadmapHistory];
        newHistory[existingIndex] = activeRoadmap;
    } else {
        // Add the new roadmap to the beginning of the history
        newHistory = [activeRoadmap, ...roadmapHistory];
    }
    updateHistory(newHistory);
  }, [activeRoadmap, roadmapHistory]);


  /**
   * Loads a selected roadmap from the history into the active view.
   * @param id - The ID of the roadmap to load.
   */
  const handleLoadRoadmap = (id: string) => {
    const roadmapToLoad = roadmapHistory.find(r => r.id === id);
    if (roadmapToLoad) {
        setActiveRoadmap(roadmapToLoad);
        setActiveView('roadmap'); // Switch to roadmap view when loading
        setIsHistoryOpen(false);
    }
  };
  
  /**
   * Deletes a roadmap from the history.
   * @param id - The ID of the roadmap to delete.
   */
  const handleDeleteRoadmap = (id: string) => {
    const newHistory = roadmapHistory.filter(r => r.id !== id);
    updateHistory(newHistory);
    // If the deleted roadmap was the active one, clear the view.
    if (activeRoadmap?.id === id) {
      setActiveRoadmap(null);
    }
  };

  /**
   * Toggles the completion status of a single node within the active roadmap.
   * Also updates the history if the active roadmap has been saved.
   * @param nodeId - The ID of the node to toggle.
   */
  const handleToggleNodeCompletion = useCallback((nodeId: string) => {
    if (!activeRoadmap) return;
    
    const updatedNodes = activeRoadmap.nodes.map(node => 
        node.id === nodeId ? { ...node, completed: !node.completed } : node
    );
    
    const updatedRoadmap = { ...activeRoadmap, nodes: updatedNodes };
    setActiveRoadmap(updatedRoadmap);

    // If the roadmap is already in history, update it there as well to persist progress.
    const isSaved = roadmapHistory.some(r => r.id === updatedRoadmap.id);
    if (isSaved) {
        const newHistory = roadmapHistory.map(r => r.id === updatedRoadmap.id ? updatedRoadmap : r);
        updateHistory(newHistory);
    }
  }, [activeRoadmap, roadmapHistory]);


  /**
   * Handles the PWA installation request.
   */
  const handleInstall = async () => {
    if (installPromptEvent && 'prompt' in installPromptEvent) {
      (installPromptEvent as any).prompt();
      const { outcome } = await (installPromptEvent as any).userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPromptEvent(null);
    }
  };
  
  return (
    <div className="min-h-screen bg-brand-primary text-brand-text-primary font-sans flex flex-col">
      <Header 
        onInstall={handleInstall}
        showInstallButton={!!installPromptEvent}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        {/* The history panel is conditionally rendered as an overlay */}
        {isHistoryOpen && <HistoryPanel history={roadmapHistory} onLoad={handleLoadRoadmap} onDelete={handleDeleteRoadmap} onClose={() => setIsHistoryOpen(false)} />}
        
        <div className="w-full max-w-6xl">
            <Navigation activeView={activeView} setActiveView={setActiveView} onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)} />

            <div className="mt-8">
                {activeView === 'roadmap' && (
                    <RoadmapGeneratorView
                        activeRoadmap={activeRoadmap}
                        setActiveRoadmap={setActiveRoadmap}
                        roadmapHistory={roadmapHistory}
                        onSaveOrUpdateRoadmap={handleSaveOrUpdateRoadmap}
                        onToggleNodeCompletion={handleToggleNodeCompletion}
                    />
                )}
                {activeView === 'analytics' && <AnalyticsHubView />}
                {activeView === 'knowledge' && <KnowledgeBaseView setActiveRoadmap={setActiveRoadmap} setActiveView={setActiveView} />}
                {activeView === 'compliance' && <ComplianceEngineView />}
            </div>
        </div>
      </main>
      <footer className="text-center p-4 text-brand-text-secondary text-sm border-t border-brand-border">
          <p>ImpactSolutionRoadmap.sh | Licensed under MIT | An Open-Source, Non-Commercial Project.</p>
      </footer>
    </div>
  );
};

export default App;
