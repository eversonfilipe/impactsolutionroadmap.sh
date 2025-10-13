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

type ReportTab = 'summary' | 'checklist' | 'matrix' | 'document';

/**
 * The main view for the Smart Compliance Engine. It enables users to select a regulation,
 * provide context, and receive a comprehensive, AI-generated compliance package.
 */
const ComplianceEngineView: React.FC = () => {
    const [context, setContext] = useState('');
    const [selectedRegulation, setSelectedRegulation] = useState(regulations[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<ComplianceReport | null>(null);
    const [activeTab, setActiveTab] = useState<ReportTab>('summary');

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
            setActiveTab('summary'); // Reset to summary tab on new report
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMarkdown = (markdown: string) => {
        if (!markdown) return null;
        const raw = marked.parse(markdown, { gfm: true, breaks: true });
        const clean = DOMPurify.sanitize(raw as string);
        return <div className="prose prose-invert prose-sm max-w-none text-brand-text-secondary" dangerouslySetInnerHTML={{ __html: clean }} />;
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
                 <p className="text-xs text-brand-text-secondary text-center">
                    For your privacy, please do not include sensitive personal information in your description.
                </p>
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
                 <div className="space-y-4 animate-fade-in mt-8 bg-brand-secondary p-6 rounded-lg border border-brand-border">
                    <h3 className="text-center text-xl font-bold">Compliance Package for: <span className="text-brand-accent">{report.regulation}</span></h3>
                    
                    {/* Tab Navigation */}
                    <div className="flex border-b border-brand-border">
                        <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'summary' ? 'border-b-2 border-brand-accent text-brand-accent' : 'text-brand-text-secondary'}`}>Summary</button>
                        <button onClick={() => setActiveTab('checklist')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'checklist' ? 'border-b-2 border-brand-accent text-brand-accent' : 'text-brand-text-secondary'}`}>Checklist</button>
                        <button onClick={() => setActiveTab('matrix')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'matrix' ? 'border-b-2 border-brand-accent text-brand-accent' : 'text-brand-text-secondary'}`}>Materiality Matrix</button>
                        <button onClick={() => setActiveTab('document')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'document' ? 'border-b-2 border-brand-accent text-brand-accent' : 'text-brand-text-secondary'}`}>Draft Document</button>
                    </div>

                    {/* Tab Content */}
                    <div className="pt-4">
                        {activeTab === 'summary' && renderMarkdown(report.summaryOfObligations)}
                        {activeTab === 'checklist' && renderMarkdown(report.checklistMarkdown)}
                        {activeTab === 'matrix' && renderMarkdown(report.materialityMatrixMarkdown)}
                        {activeTab === 'document' && renderMarkdown(report.draftDocumentMarkdown)}
                    </div>
                 </div>
            )}
        </div>
    );
};

export default ComplianceEngineView;