import React, { useState } from 'react';
import { answerEsgQuestion, generateRoadmapStream, processStreamedResponse } from '../../services/geminiService';
import { Roadmap, RoadmapNode } from '../../types';
import { AppView } from '../../App';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Props for the KnowledgeBaseView component.
 * @interface
 */
interface KnowledgeBaseViewProps {
    /** Function to set the active roadmap in the main App component. */
    setActiveRoadmap: (roadmap: Roadmap | null) => void;
    /** Function to change the active view in the main App component. */
    setActiveView: (view: AppView) => void;
}

/**
 * The view for the Collaborative Knowledge Base. It allows users to ask the AI expert
 * questions about ESG topics and to generate roadmap templates on the fly.
 * @param {KnowledgeBaseViewProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered KnowledgeBaseView.
 */
const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ setActiveRoadmap, setActiveView }) => {
    const [question, setQuestion] = useState('');
    const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [answer, setAnswer] = useState('');

    const [templatePrompt, setTemplatePrompt] = useState('');
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
    
    /**
     * Handles the form submission for asking an ESG question.
     * @param {React.FormEvent} e - The form submission event.
     */
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

    /**
     * Handles the form submission for generating a roadmap template.
     * It calls the main roadmap generation service and then switches the view.
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleGenerateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!templatePrompt.trim()) return;

        setIsLoadingTemplate(true);
        setError(null);

        const fullPrompt = `Create a roadmap template for the following request: "${templatePrompt}"`;

        // This uses the main roadmap generation stream but directs the output
        // to the main roadmap view, creating a seamless template-to-roadmap workflow.
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

    /**
     * Safely renders a Markdown string into HTML.
     * @param {string} markdown - The markdown content to render.
     * @returns {React.ReactElement} A div containing the sanitized HTML.
     */
    const renderMarkdown = (markdown: string) => {
        const raw = marked.parse(markdown, { gfm: true, breaks: true });
        const clean = DOMPurify.sanitize(raw as string);
        return <div className="prose prose-invert prose-sm max-w-none text-brand-text-secondary" dangerouslySetInnerHTML={{ __html: clean }} />;
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
                <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border space-y-4">
                    <h3 className="text-xl font-bold text-center">Ask the ESG Expert</h3>
                     <form onSubmit={handleAskQuestion} className="space-y-2">
                        <textarea
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="e.g., 'Compare GRI and SASB standards for a tech company.'"
                          className="w-full h-24 p-3 bg-brand-primary border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                          disabled={isLoadingAnswer}
                          aria-label="Ask a question about ESG"
                        />
                        <button
                          type="submit"
                          disabled={isLoadingAnswer || !question.trim()}
                          className="w-full py-2 px-4 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-md disabled:bg-gray-600"
                        >
                            {isLoadingAnswer ? 'Thinking...' : 'Ask Question'}
                        </button>
                    </form>
                    {(isLoadingAnswer || answer) && (
                        <div className="bg-brand-primary p-4 rounded-lg border border-brand-border min-h-[200px] mt-4">
                            {renderMarkdown(answer)}
                            {isLoadingAnswer && <span className="blinking-cursor">|</span>}
                        </div>
                    )}
                </div>

                {/* Right side: Generate a template */}
                <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border space-y-4">
                     <h3 className="text-xl font-bold text-center">Generate a Roadmap Template</h3>
                     <form onSubmit={handleGenerateTemplate} className="space-y-2">
                         <textarea
                          value={templatePrompt}
                          onChange={(e) => setTemplatePrompt(e.target.value)}
                          placeholder="e.g., 'An ESG roadmap for a small-scale coffee farm.'"
                          className="w-full h-24 p-3 bg-brand-primary border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                          disabled={isLoadingTemplate}
                          aria-label="Prompt for roadmap template"
                        />
                        <button
                          type="submit"
                          disabled={isLoadingTemplate || !templatePrompt.trim()}
                          className="w-full py-2 px-4 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-md disabled:bg-gray-600"
                        >
                            {isLoadingTemplate ? 'Generating...' : 'Generate Template & Go'}
                        </button>
                    </form>
                    <div className="text-sm text-brand-text-secondary p-4 bg-brand-primary rounded-md border border-brand-border mt-4">
                        <p className="font-semibold mb-1">How this works:</p>
                        <p>This will generate a new roadmap based on your request and take you to the "Roadmap Generator" tab. You can then edit, track, and save it as usual.</p>
                    </div>
                </div>
            </div>
             <p className="text-xs text-brand-text-secondary text-center pt-4">
                For your privacy, please do not include sensitive personal information in your prompts.
            </p>
             <style>{`
                .blinking-cursor {
                    font-weight: bold;
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