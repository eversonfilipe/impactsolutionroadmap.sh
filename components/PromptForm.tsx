import React, { useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

/**
 * Props for the PromptForm component.
 */
interface PromptFormProps {
  /** The function to call when the form is submitted for generation. */
  onGenerate: (prompt: string, files: File[]) => void;
  /** A boolean indicating if the AI generation is currently in progress. */
  isLoading: boolean;
}

/**
 * A form component that allows the user to input their main prompt
 * and upload optional context files. It handles the UI for user input
 * before triggering the roadmap generation process.
 */
const PromptForm: React.FC<PromptFormProps> = ({ onGenerate, isLoading }) => {
  /** State to hold the value of the main prompt textarea. */
  const [prompt, setPrompt] = useState('');
  /** State to hold the array of files selected by the user for context. */
  const [files, setFiles] = useState<File[]>([]);

  /**
   * Handles changes to the file input element, updating the files state.
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  /**
   * Handles the form submission, preventing the default action and calling
   * the onGenerate prop with the current prompt and files.
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onGenerate(prompt, files);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-brand-secondary p-6 rounded-lg border border-brand-border">
      <div>
        <label htmlFor="prompt" className="block text-lg font-semibold mb-2 text-brand-text-primary">
          1. Your Roadmap Goal
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Create a blueprint for a community-based water governance system for a semi-arid region...'"
          className="w-full h-32 p-3 bg-brand-primary border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent transition-shadow"
          disabled={isLoading}
          aria-label="Roadmap Goal Prompt"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold mb-2 text-brand-text-primary">
          2. Add Context (Optional)
        </label>
        <div className="relative border-2 border-dashed border-brand-border rounded-lg p-6 text-center hover:border-brand-accent transition-colors">
          <input
            type="file"
            id="context-files"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
            accept=".txt,.md,.json,.html"
            aria-label="Upload context files"
          />
          <div className="flex flex-col items-center text-brand-text-secondary">
            <UploadIcon className="w-8 h-8 mb-2" />
            <p>Drag & drop files or <span className="text-brand-accent font-semibold">click to browse</span></p>
            <p className="text-xs mt-1">Supported: .txt, .md, .json, .html</p>
          </div>
        </div>
        {files.length > 0 && (
          <div className="mt-4 text-sm text-brand-text-secondary" aria-live="polite">
            <p className="font-semibold text-brand-text-primary">Selected files:</p>
            <ul className="list-disc list-inside">
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full py-3 px-4 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-md transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Roadmap...
          </>
        ) : (
          'Generate Blueprint'
        )}
      </button>
    </form>
  );
};

export default PromptForm;
