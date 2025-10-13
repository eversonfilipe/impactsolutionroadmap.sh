import React, { useState, useCallback } from 'react';
import { Roadmap, RoadmapNode } from '../../types';
import { generateRoadmapStream, processStreamedResponse } from '../../services/geminiService';
import { readFilesAsText } from '../../utils/fileReader';
import PromptForm from '../PromptForm';
import RoadmapDisplay from '../RoadmapDisplay';
import StreamingResponseDisplay from '../StreamingResponseDisplay';

interface RoadmapGeneratorViewProps {
  activeRoadmap: Roadmap | null;
  setActiveRoadmap: (roadmap: Roadmap | null) => void;
  roadmapHistory: Roadmap[];
  onSaveOrUpdateRoadmap: () => void;
  onToggleNodeCompletion: (nodeId: string) => void;
}

/**
 * A view component dedicated to the core functionality of generating and displaying roadmaps.
 */
const RoadmapGeneratorView: React.FC<RoadmapGeneratorViewProps> = ({
  activeRoadmap,
  setActiveRoadmap,
  roadmapHistory,
  onSaveOrUpdateRoadmap,
  onToggleNodeCompletion,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingResponse, setStreamingResponse] = useState('');

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
  }, [setActiveRoadmap]);

  return (
    <div className="animate-fade-in">
      <PromptForm onGenerate={handleGenerate} isLoading={isLoading} />
      
      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {isLoading && <StreamingResponseDisplay text={streamingResponse} />}
      
      {activeRoadmap && !isLoading && (
        <div className="mt-8">
          <RoadmapDisplay 
            roadmap={activeRoadmap}
            onSave={onSaveOrUpdateRoadmap}
            onToggleNodeCompletion={onToggleNodeCompletion}
            isSaved={roadmapHistory.some(r => r.id === activeRoadmap.id)}
          />
        </div>
      )}
    </div>
  );
};

export default RoadmapGeneratorView;
