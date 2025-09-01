import React, { useState, useEffect, useCallback } from 'react';
import { Roadmap, RoadmapNode } from './types';
import { generateRoadmapStream, processStreamedResponse } from './services/geminiService';
import { readFilesAsText } from './utils/fileReader';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import RoadmapDisplay from './components/RoadmapDisplay';
import HistoryPanel from './components/HistoryPanel';
import StreamingResponseDisplay from './components/StreamingResponseDisplay';

/**
 * The key used to store the roadmap history in the browser's local storage.
 */
const LOCAL_STORAGE_HISTORY_KEY = 'impact_roadmaps_history';

/**
 * The main application component. It orchestrates the entire user flow,
 * managing state for the active roadmap, generation process, and user's history.
 */
const App: React.FC = () => {
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
   * A boolean flag indicating if the AI is currently generating a response.
   */
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Stores any error message that occurs during the generation process.
   */
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Stores the raw, incoming text from the AI during a streaming response.
   */
  const [streamingResponse, setStreamingResponse] = useState('');

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
   * Handles the entire roadmap generation process, from reading files to calling the AI service
   * and processing the streamed response.
   * @param prompt - The user's primary goal for the roadmap.
   * @param files - An array of context files uploaded by the user.
   */
  const handleGenerate = useCallback(async (prompt: string, files: File[]) => {
    if (!prompt.trim()) {
        setError("Prompt cannot be empty.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setActiveRoadmap(null);
    setStreamingResponse('');
    let accumulatedText = '';

    try {
      const context = files.length > 0 ? await readFilesAsText(files) : '';
      
      await generateRoadmapStream(prompt, context, {
        onChunk: (textChunk) => {
            accumulatedText += textChunk;
            setStreamingResponse(accumulatedText);
        },
        onComplete: (fullText) => {
            try {
                const generatedData = processStreamedResponse(fullText);

                // Sanitize the data received from the AI to prevent runtime errors.
                // This ensures that expected arrays are always arrays.
                const sanitizedNodes = (generatedData.nodes || []).map((n: Partial<RoadmapNode>) => ({
                    id: n.id || `node-${Math.random().toString(36).substr(2, 9)}`,
                    title: n.title || 'Untitled Node',
                    content: n.content || 'No content provided.',
                    connections: Array.isArray(n.connections) ? n.connections : [],
                    references: Array.isArray(n.references) ? n.references : [],
                    completed: false,
                }));

                const newRoadmap: Roadmap = {
                    id: `roadmap_${Date.now()}`,
                    generatedAt: Date.now(),
                    title: generatedData.title || 'Untitled Roadmap',
                    description: generatedData.description || '',
                    nodes: sanitizedNodes,
                    sources: Array.isArray(generatedData.sources) ? generatedData.sources : [],
                };
                
                setActiveRoadmap(newRoadmap);
            } catch (parseError) {
                console.error(parseError);
                setError(parseError instanceof Error ? parseError.message : "Failed to parse the final roadmap from the AI's response.");
            } finally {
                setIsLoading(false);
            }
        },
        onError: (streamError) => {
            console.error(streamError);
            setError(streamError.message);
            setIsLoading(false);
        }
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during setup for roadmap generation.");
      setIsLoading(false);
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
  const handleSaveOrUpdateRoadmap = () => {
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
  };

  /**
   * Loads a selected roadmap from the history into the active view.
   * @param id - The ID of the roadmap to load.
   */
  const handleLoadRoadmap = (id: string) => {
    const roadmapToLoad = roadmapHistory.find(r => r.id === id);
    if (roadmapToLoad) {
        setActiveRoadmap(roadmapToLoad);
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
  const handleToggleNodeCompletion = (nodeId: string) => {
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
  };
  
  return (
    <div className="min-h-screen bg-brand-primary text-brand-text-primary font-sans flex flex-col">
      <Header 
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        {/* The history panel is conditionally rendered as an overlay */}
        {isHistoryOpen && <HistoryPanel history={roadmapHistory} onLoad={handleLoadRoadmap} onDelete={handleDeleteRoadmap} onClose={() => setIsHistoryOpen(false)} />}
        
        <div className="w-full max-w-4xl">
          <PromptForm onGenerate={handleGenerate} isLoading={isLoading} />
          
          {error && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* Display the streaming response while loading */}
          {isLoading && <StreamingResponseDisplay text={streamingResponse} />}
          
          {/* Display the final, formatted roadmap when not loading and one is active */}
          {activeRoadmap && !isLoading && (
            <div className="mt-8">
              <RoadmapDisplay 
                roadmap={activeRoadmap}
                onSave={handleSaveOrUpdateRoadmap}
                onToggleNodeCompletion={handleToggleNodeCompletion}
                isSaved={roadmapHistory.some(r => r.id === activeRoadmap.id)}
              />
            </div>
          )}
        </div>
      </main>
      <footer className="text-center p-4 text-brand-text-secondary text-sm border-t border-brand-border">
          <p>ImpactSolutionRoadmap.sh | Licensed under MIT | An Open-Source, Non-Commercial Project.</p>
      </footer>
    </div>
  );
};

export default App;
