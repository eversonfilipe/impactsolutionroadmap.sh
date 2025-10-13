/**
 * Represents a single node or step within a roadmap.
 * Each node has content, can have references, and connects to other nodes,
 * forming the building blocks of the overall blueprint.
 */
export interface RoadmapNode {
  /** A unique identifier for the node (e.g., 'phase-1', 'task-alpha'). */
  id: string;
  /** The title of this specific step. */
  title: string;
  /** Detailed description of the node's purpose, tasks, and goals. Expected to be in Markdown format. */
  content: string;
  /** An array of URLs or source identifiers that support this node's content. */
  references?: string[];
  /** An array of other node IDs that this node logically connects to, defining the roadmap's flow. */
  connections: string[];
  /** A boolean flag to track whether this step has been completed by the user. */
  completed?: boolean;
}

/**
 * Represents the entire roadmap structure.
 * It serves as the main data object for a generated blueprint, including metadata,
 * content, and the nodes that form the plan.
 */
export interface Roadmap {
  /** A unique identifier for the roadmap, generated at creation time for versioning and history management. */
  id:string;
  /** A Unix timestamp indicating when the roadmap was generated. */
  generatedAt: number;
  /** The main title of the entire roadmap project. */
  title: string;
  /** A brief, one-paragraph overview of the roadmap's purpose and scope. */
  description: string;
  /** An array of `RoadmapNode` objects that constitute the steps of the roadmap. */
  nodes: RoadmapNode[];
  /** An array of sources found by the AI's web search, used to ground the information. */
  sources?: {
    uri: string;
    title: string;
  }[];
}


/**
 * Represents the breakdown of an estimated carbon footprint.
 */
export interface CarbonFootprint {
  /** Estimated emissions from direct sources (e.g., company vehicles). */
  scope1: number;
  /** Estimated emissions from purchased electricity, heat, etc. */
  scope2: number;
  /** Estimated emissions from indirect sources (e.g., supply chain). */
  scope3: number;
  /** The unit of measurement (e.g., 'tCO2e'). */
  unit: string;
  /** A brief explanation of the estimation methodology. */
  methodology: string;
}

/**
 * Represents a single Environmental, Social, or Governance metric.
 */
export interface EsgMetric {
  /** The name of the metric (e.g., 'Water Usage Intensity'). */
  name: string;
  /** The value of the metric. */
  value: string;
  /** The category of the metric. */
  category: 'Environmental' | 'Social' | 'Governance';
  /** A brief explanation or suggestion related to the metric. */
  insight: string;
}

/**
 * Represents the entire AI-generated ESG analytics report.
 */
export interface AnalyticsReport {
  /** The overall ESG score, typically out of 100. */
  overallScore: number;
  /** A summary of the ESG analysis. */
  summary: string;
  /** The detailed carbon footprint estimation. */
  carbonFootprint: CarbonFootprint;
  /** An array of suggested ESG metrics and KPIs. */
  metrics: EsgMetric[];
  /** A generated draft of a sustainability report in Markdown format. */
  draftReportMarkdown: string;
  /** Actionable recommendations based on the analysis, in Markdown format. */
  recommendations: string;
}


/**
 * Represents the AI-generated compliance report for a specific regulation.
 */
export interface ComplianceReport {
    /** The regulation the report is for. */
    regulation: string;
    /** A high-level summary of the key obligations under the regulation, in Markdown format. */
    summaryOfObligations: string;
    /** A detailed compliance checklist in Markdown format. */
    checklistMarkdown: string;
    /** A generated draft of a key document in Markdown format. */
    draftDocumentMarkdown: string;
    /** A generated materiality matrix, also in Markdown format for easy rendering. */
    materialityMatrixMarkdown: string;
}