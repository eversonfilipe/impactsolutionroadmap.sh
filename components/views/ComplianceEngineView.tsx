import React, { useState } from 'react';
import { generateComplianceReport } from '../../services/geminiService';
import { ComplianceReport } from '../../types';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const regulations = [
    "CSRD (Corporate Sustainability Reporting Directive)",
    "TCFD (Task Force on Climate-related Financial Disclosures)",
    "EU Taxonomy for Sustainable Activities",
    "SASB (Sustainability Accounting Standards Board)",
    "GRI (Global Reporting Initiative)",
];

const ComplianceEngineView: React.FC = () => {
    const [context, setContext] = useState('');
    const [selectedRegulation, setSelectedRegulation] = useState(regulations[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<ComplianceReport | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!context.trim()) {
            setError('Please provide your organization context.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setReport(null);
        try {
            const result = await generateComplianceReport(selectedRegulation, context);
            setReport(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMarkdown = (markdown: string) => {
        const raw = marked.parse(markdown, { gfm: true, breaks: true });
        const clean = DOMPurify.sanitize(raw as string);
        return <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: clean }} />;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Smart ESG Compliance Automation Engine</h2>
                <p className="text-brand-text-secondary">Generate an AI-powered compliance package for global ESG regulations.</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 bg-brand-secondary p-6 rounded-lg border border-brand-border">
                <div>
                    <label htmlFor="regulation" className="block text-lg font-semibold mb-2 text-brand-text-primary">
                        1. Select Regulation
                    </label>
                    <select
                        id="regulation"
                        value={selectedRegulation}
                        onChange={(e) => setSelectedRegulation(e.target.value)}
                        className="w-full p-3 bg-brand-primary border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        disabled={isLoading}
                    >
                        {regulations.map(reg => <option key={reg} value={reg}>{reg}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="context" className="block text-lg font-semibold mb-2 text-brand-text-primary">
                        2. Provide Organization Context
                    </label>
                    <textarea
                        id="context"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="e.g., 'We are a publicly-listed software company in the EU with 600 employees and €80M in annual revenue...'"
                        className="w-full h-24 p-3 bg-brand-primary border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent transition-shadow"
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !context.trim()}
                    className="w-full py-3 px-4 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-md transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? 'Generating Package...' : 'Generate Compliance Package'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                    <p className="font-bold">Error:</p>
                    <p>{error}</p>
                </div>
            )}

            {report && (
                 <div className="space-y-6 animate-fade-in mt-8">
                    <h3 className="text-center text-2xl font-bold">Compliance Package for {report.regulation}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border">
                           <h4 className="text-lg font-bold text-brand-accent mb-2">Compliance Checklist</h4>
                           {renderMarkdown(report.checklistMarkdown)}
                        </div>
                         <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border">
                           <h4 className="text-lg font-bold text-brand-accent mb-2">Materiality Matrix</h4>
                           {renderMarkdown(report.materialityMatrixMarkdown)}
                        </div>
                    </div>
                     <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border">
                           <h4 className="text-lg font-bold text-brand-accent mb-2">Draft Compliance Document</h4>
                           {renderMarkdown(report.draftDocumentMarkdown)}
                        </div>
                 </div>
            )}
        </div>
    );
};

export default ComplianceEngineView;
