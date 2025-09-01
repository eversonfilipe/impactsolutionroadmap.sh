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
