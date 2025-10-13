import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Roadmap, RoadmapNode } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { SaveIcon } from './icons/SaveIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import ProgressBar from './ProgressBar';
import { InfoIcon } from './icons/InfoIcon';

/**
 * Props for the RoadmapDisplay component.
 * @interface
 */
interface RoadmapDisplayProps {
  /** The roadmap object to display. */
  roadmap: Roadmap;
  /** Callback function to save the roadmap. */
  onSave: () => void;
  /** Callback function to toggle the completion status of a node. */
  onToggleNodeCompletion: (nodeId: string) => void;
  /** A boolean indicating if the roadmap is currently saved in the history. */
  isSaved: boolean;
}

/**
 * Props for the NodeCard sub-component.
 * @interface
 */
interface NodeCardProps {
    /** The node object to render. */
    node: RoadmapNode;
    /** An array of all nodes in the roadmap, used to look up connection titles. */
    allNodes: RoadmapNode[];
    /** Callback function to toggle the node's completion status. */
    onToggleCompletion: (id: string) => void;
}

/**
 * Safely parses and sanitizes a Markdown string for rendering as HTML.
 * @param {string | null | undefined} markdown - The markdown content to parse.
 * @returns {string} Sanitized HTML string.
 */
const parseAndSanitizeMarkdown = (markdown: string | null | undefined): string => {
    if (!markdown) return '';
    const rawMarkup = marked.parse(markdown, { gfm: true, breaks: true });
    return DOMPurify.sanitize(rawMarkup as string);
};

/**
 * A sub-component to render a single node within the roadmap.
 * It handles displaying the node's title, content (as sanitized HTML), references, and connections.
 * @param {NodeCardProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered NodeCard.
 */
const NodeCard: React.FC<NodeCardProps> = ({ node, allNodes, onToggleCompletion }) => {
  
  // Find the titles of the nodes this node connects to for a more user-friendly display.
  const connectionTitles = node.connections
    .map(connId => allNodes.find(n => n.id === connId)?.title)
    .filter(Boolean); // Filter out any undefined titles if a connection is invalid.

  const cleanContent = parseAndSanitizeMarkdown(node.content);
  const cleanRationale = parseAndSanitizeMarkdown(node.rationale);


  return (
    <div className={`bg-brand-secondary border border-brand-border rounded-lg p-5 break-words transition-opacity duration-300 ${node.completed ? 'opacity-60' : 'opacity-100'}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-brand-accent mb-2 flex-1 pr-4">{node.title} <span className="text-xs font-mono text-brand-text-secondary ml-2">ID: {node.id}</span></h3>
        <button
          onClick={() => onToggleCompletion(node.id)}
          title={node.completed ? "Mark as Incomplete" : "Mark as Complete"}
          className={`flex-shrink-0 p-1 rounded-full transition-colors ${node.completed ? 'text-green-400' : 'text-gray-500 hover:text-green-400'}`}
          aria-label={node.completed ? `Mark ${node.title} as incomplete` : `Mark ${node.title} as complete`}
        >
          <CheckCircleIcon className="w-6 h-6" />
        </button>
      </div>

      <div 
        className="prose prose-invert prose-sm max-w-none text-brand-text-secondary space-y-3"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />
      
       {cleanRationale && (
        <div className="mt-4 p-3 bg-brand-primary/50 border-l-4 border-blue-400 rounded-r-md">
          <h4 className="font-semibold text-sm text-brand-text-primary flex items-center gap-2">
            <InfoIcon className="w-4 h-4" />
            Why it Matters (Rationale)
          </h4>
          <div
            className="prose prose-invert prose-xs max-w-none text-brand-text-secondary mt-1"
            dangerouslySetInnerHTML={{ __html: cleanRationale }}
          />
        </div>
      )}

      {node.references && node.references.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-sm text-brand-text-primary">References:</h4>
          <ul className="list-disc list-inside text-sm text-brand-text-secondary mt-1">
            {node.references.map((ref, index) => (
              <li key={index}>
                {ref.startsWith('http') ? <a href={ref} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{ref}</a> : ref}
              </li>
            ))}
          </ul>
        </div>
      )}

      {connectionTitles.length > 0 && (
         <div className="mt-4 pt-3 border-t border-brand-border">
          <h4 className="font-semibold text-sm text-brand-text-primary">Connects to:</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {connectionTitles.map((title, index) => (
              <span key={index} className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">
                {title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * The main component for displaying a generated roadmap.
 * It renders the roadmap's title, description, progress, sources, and all its nodes.
 * It also provides functionality for saving and downloading the roadmap.
 * @param {RoadmapDisplayProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered RoadmapDisplay component.
 */
const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({ roadmap, onSave, onToggleNodeCompletion, isSaved }) => {

  /**
   * Generates a string of the entire roadmap in Markdown format.
   * @param {Roadmap} roadmapToConvert - The roadmap object to convert.
   * @returns {string} A string containing the roadmap in Markdown format.
   */
  const generateMarkdownContent = (roadmapToConvert: Roadmap): string => {
    let markdown = `# ${roadmapToConvert.title}\n\n`;
    markdown += `${roadmapToConvert.description}\n\n`;
    markdown += '---\n\n';

    if (roadmapToConvert.sources && roadmapToConvert.sources.length > 0) {
      markdown += `### Grounding Sources\n`;
      roadmapToConvert.sources.forEach(source => markdown += `- [${source.title}](${source.uri})\n`);
      markdown += `\n---\n\n`;
    }

    roadmapToConvert.nodes.forEach(node => {
      markdown += `## ${node.completed ? '[x]' : '[ ]'} ${node.title}\n\n`;
      markdown += `**ID:** \`${node.id}\`\n\n`;
      markdown += `${node.content}\n\n`;
      
      if (node.rationale) {
        markdown += `**Rationale:** ${node.rationale}\n\n`;
      }
      
      if (node.references && node.references.length > 0) {
        markdown += `### References\n`;
        node.references.forEach(ref => markdown += `- ${ref}\n`);
        markdown += `\n`;
      }

      if (node.connections && node.connections.length > 0) {
        const connectionTitles = node.connections.map(connId => roadmapToConvert.nodes.find(n => n.id === connId)?.title).filter(Boolean);
        if (connectionTitles.length > 0) {
            markdown += `### Connects To\n`;
            connectionTitles.forEach(title => markdown += `- ${title}\n`);
            markdown += `\n`;
        }
      }
      markdown += '---\n\n';
    });

    return markdown;
  };

  /**
   * Handles the download action by generating the Markdown content, creating a blob,
   * and simulating a click on a temporary link.
   */
  const handleDownload = () => {
    const markdownContent = generateMarkdownContent(roadmap);
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    // Sanitize title for a safe filename.
    const fileName = `${roadmap.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate the completion progress of the roadmap.
  const completedNodes = roadmap.nodes.filter(n => n.completed).length;
  const progress = roadmap.nodes.length > 0 ? (completedNodes / roadmap.nodes.length) * 100 : 0;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="border-b border-brand-border pb-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2 text-center">
            <h1 className="text-4xl font-extrabold text-brand-text-primary">{roadmap.title}</h1>
            <div className="flex items-center gap-2">
                <button onClick={onSave} className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${isSaved ? 'bg-green-800/60 hover:bg-green-700/70' : 'bg-brand-accent/80 hover:bg-brand-accent'} text-white`} title={isSaved ? "Roadmap Saved (progress updates automatically)" : "Save Roadmap"}>
                    <SaveIcon className="w-5 h-5" />
                    <span className="text-sm font-semibold">{isSaved ? "Saved" : "Save"}</span>
                </button>
                <button onClick={handleDownload} className="flex items-center space-x-2 px-3 py-2 rounded-md bg-brand-secondary hover:bg-brand-border text-brand-text-secondary transition-colors" title="Download Roadmap as Markdown">
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        <p className="text-lg text-brand-text-secondary max-w-3xl mx-auto text-center mt-2">{roadmap.description}</p>
        
        <div className="mt-6 max-w-2xl mx-auto">
            <ProgressBar progress={progress} />
        </div>
      </div>
      
      {roadmap.sources && roadmap.sources.length > 0 && (
          <div className="bg-brand-secondary border border-brand-border rounded-lg p-5">
              <h3 className="text-xl font-bold text-brand-accent mb-3">Sources</h3>
              <ul className="space-y-2">
                  {roadmap.sources.map((source, index) => (
                      <li key={index} className="text-sm">
                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-start gap-2">
                            <span className="font-semibold">&#8226;</span>
                            <span>{source.title || source.uri}</span>
                          </a>
                      </li>
                  ))}
              </ul>
          </div>
      )}

      <div className="space-y-6">
        {roadmap.nodes.map((node) => (
          <NodeCard key={node.id} node={node} allNodes={roadmap.nodes} onToggleCompletion={onToggleNodeCompletion}/>
        ))}
      </div>
    </div>
  );
};

export default RoadmapDisplay;
