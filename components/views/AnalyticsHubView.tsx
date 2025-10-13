import React, { useState } from 'react';
import { generateAnalyticsReport } from '../../services/geminiService';
import { AnalyticsReport } from '../../types';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const KpiCard: React.FC<{ metric: { name: string; value: string; category: string; insight: string } }> = ({ metric }) => {
    const categoryColor = {
        Environmental: 'border-green-500',
        Social: 'border-blue-500',
        Governance: 'border-purple-500',
    }[metric.category] || 'border-gray-500';

    return (
        <div className={`bg-brand-secondary p-4 rounded-lg border-l-4 ${categoryColor}`}>
            <p className="text-sm text-brand-text-secondary">{metric.category}</p>
            <p className="text-lg font-bold text-brand-text-primary">{metric.name}</p>
            <p className="text-2xl font-extrabold text-brand-accent">{metric.value}</p>
            <p className="text-xs mt-2 text-brand-text-secondary">{metric.insight}</p>
        </div>
    );
};


const AnalyticsHubView: React.FC = () => {
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<AnalyticsReport | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            setError('Please provide a project description.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setReport(null);
        try {
            const result = await generateAnalyticsReport(description);
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
                <h2 className="text-2xl font-bold">ESG Impact Measurement & Analytics Hub</h2>
                <p className="text-brand-text-secondary">Generate an AI-powered ESG analysis based on your project description.</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 bg-brand-secondary p-6 rounded-lg border border-brand-border">
                <div>
                    <label htmlFor="description" className="block text-lg font-semibold mb-2 text-brand-text-primary">
                        Project or Organization Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., 'We are a 100-person textile manufacturer in Brazil, specializing in organic cotton. Our factory uses solar panels for 30% of its energy needs...'"
                        className="w-full h-40 p-3 bg-brand-primary border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent transition-shadow"
                        disabled={isLoading}
                        aria-label="Project or Organization Description"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !description.trim()}
                    className="w-full py-3 px-4 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-md transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? 'Generating Analysis...' : 'Generate ESG Analysis'}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 bg-brand-secondary p-6 rounded-lg border border-brand-border text-center">
                            <h3 className="text-lg font-bold text-brand-text-primary">Overall ESG Score</h3>
                            <p className="text-6xl font-extrabold text-brand-accent my-4">{report.overallScore}<span className="text-2xl">/100</span></p>
                            <p className="text-sm text-brand-text-secondary">{report.summary}</p>
                        </div>
                        <div className="md:col-span-2 bg-brand-secondary p-6 rounded-lg border border-brand-border">
                             <h3 className="text-lg font-bold text-brand-text-primary mb-4">Estimated Carbon Footprint ({report.carbonFootprint.unit})</h3>
                             <div className="space-y-3">
                                {Object.entries(report.carbonFootprint).filter(([key]) => key.startsWith('scope')).map(([scope, value]) => (
                                    <div key={scope}>
                                        <p className="text-sm capitalize font-semibold">{scope}</p>
                                        <div className="bg-brand-primary rounded-full h-4 border border-brand-border">
                                            <div className="bg-green-600 h-4 rounded-full" style={{ width: `${(Number(value) / (report.carbonFootprint.scope1 + report.carbonFootprint.scope2 + report.carbonFootprint.scope3)) * 100}%` }}></div>
                                        </div>
                                         <p className="text-right text-xs font-mono">{Number(value).toLocaleString()} {report.carbonFootprint.unit}</p>
                                    </div>
                                ))}
                             </div>
                             <p className="text-xs text-brand-text-secondary mt-4"><strong>Methodology:</strong> {report.carbonFootprint.methodology}</p>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-brand-text-primary mb-4">Suggested KPIs</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {report.metrics.map(metric => <KpiCard key={metric.name} metric={metric} />)}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-brand-text-primary mb-4">Draft ESG Report</h3>
                        <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border">
                            {renderMarkdown(report.draftReportMarkdown)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsHubView;
