import React, { useState } from 'react';
import { answerEsgQuestion, generateRoadmapStream, processStreamedResponse } from '../../services/geminiService';
import { Roadmap, RoadmapNode } from '../../types';
import { AppView } from '../../App';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface KnowledgeBaseViewProps {
    setActiveRoadmap: (roadmap: Roadmap | null) => void;
    setActiveView: (view: AppView) => void;
}

const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ setActiveRoadmap, setActiveView }) => {
    const [question, setQuestion] = useState('');
    const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [answer, setAnswer] = useState('');

    const [templatePrompt, setTemplatePrompt] = useState('');
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
    
    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setIsLoadingAnswer(true);
        setError(null);
        setAnswer('');
        let accumulatedText = '';

        await answerEsgQuestion(question, {
            onChunk: (chunk) => {
                accumulatedText += chunk;
                setAnswer(accumulatedText);
            },
            onComplete: () => setIsLoadingAnswer(false),
            onError: (err) => {
                setError(err.message);
                setIsLoadingAnswer(false);
            }
        });
    };

    const handleGenerateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!templatePrompt.trim()) return;

        setIsLoadingTemplate(true);
        setError(null);

        const fullPrompt = `Create a roadmap template for the following request: "${templatePrompt}"`;

        await generateRoadmapStream(fullPrompt, '', {
            onChunk: () => {}, // We don't need to show the stream here
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
                    setActiveView('roadmap'); // Switch to the roadmap view
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed to parse template.");
                } finally {
                    setIsLoadingTemplate(false);
                }
            },
            onError: (streamError) => {
                setError(streamError.message);
                setIsLoadingTemplate(false);
            }
        });
    };

    const renderMarkdown = (markdown: string) => {
        const raw = marked.parse(markdown, { gfm: true, breaks: true });
        const clean = DOMPurify.sanitize(raw as string);
        return <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: clean }} />;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Collaborative ESG Knowledge Base</h2>
                <p className="text-brand-text-secondary">Ask the AI expert or generate a roadmap template.</p>
            </div>
            
            {error && (
                <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                    <p className="font-bold">Error:</p>
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side: Ask a question */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Ask about ESG Methodologies</h3>
                     <form onSubmit={handleAskQuestion} className="space-y-2">
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="e.g., 'Compare GRI and SASB standards for a tech company.'"
                          className="w-full p-3 bg-brand-primary border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                          disabled={isLoadingAnswer}
                        />
                        <button
                          type="submit"
                          disabled={isLoadingAnswer || !question.trim()}
                          className="w-full py-2 px-4 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-md disabled:bg-gray-600"
                        >
                            {isLoadingAnswer ? 'Thinking...' : 'Ask'}
                        </button>
                    </form>
                    {(isLoadingAnswer || answer) && (
                        <div className="bg-brand-secondary p-4 rounded-lg border border-brand-border min-h-[200px]">
                            {renderMarkdown(answer)}
                            {isLoadingAnswer && <span className="blinking-cursor">|</span>}
                        </div>
                    )}
                </div>

                {/* Right side: Generate a template */}
                <div className="space-y-4">
                     <h3 className="text-lg font-semibold">Generate a Roadmap Template</h3>
                     <form onSubmit={handleGenerateTemplate} className="space-y-2">
                         <input
                          type="text"
                          value={templatePrompt}
                          onChange={(e) => setTemplatePrompt(e.target.value)}
                          placeholder="e.g., 'An ESG roadmap for a small-scale coffee farm.'"
                          className="w-full p-3 bg-brand-primary border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                          disabled={isLoadingTemplate}
                        />
                        <button
                          type="submit"
                          disabled={isLoadingTemplate || !templatePrompt.trim()}
                          className="w-full py-2 px-4 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-md disabled:bg-gray-600"
                        >
                            {isLoadingTemplate ? 'Generating...' : 'Generate Template'}
                        </button>
                    </form>
                    <div className="text-sm text-brand-text-secondary p-4 bg-brand-secondary/50 rounded-md border border-brand-border">
                        <p>This will generate a new roadmap based on your request and take you to the "Roadmap Generator" tab. You can then edit, track, and save it as usual.</p>
                    </div>
                </div>
            </div>
             <style>{`
                .blinking-cursor {
                    animation: blink 1s step-end infinite;
                }
                @keyframes blink {
                    from, to { color: transparent; }
                    50% { color: #58A6FF; }
                }
            `}</style>
        </div>
    );
};

export default KnowledgeBaseView;
