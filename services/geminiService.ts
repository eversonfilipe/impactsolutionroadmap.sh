import { GoogleGenAI } from "@google/genai";
import { Roadmap, AnalyticsReport, ComplianceReport } from '../types';

/**
 * Defines the type for the data structure returned by the AI before it is
 * hydrated with app-specific metadata like `id` and `generatedAt`.
 */
type GeneratedRoadmap = Omit<Roadmap, 'id' | 'generatedAt'>;

/**
 * Defines the callback functions that the streaming service will use to communicate
 * its state back to the UI layer (e.g., the App component).
 */
interface StreamCallbacks {
  /** Called for each piece of text received from the AI stream. */
  onChunk: (textChunk: string) => void;
  /** Called once the entire stream is complete, with the full text. */
  onComplete: (fullText: string) => void;
  /** Called if any error occurs during the streaming process. */
  onError: (error: Error) => void;
}

/**
 * A helper function to safely parse JSON from a string. It's designed to be
 * resilient, handling responses that might be wrapped in markdown code fences
 * or have conversational text around the JSON object.
 * 
 * @param {string} text The raw text from the AI.
 * @returns {T} A parsed JSON object.
 * @template T The expected type of the parsed JSON object.
 * @throws {Error} If a valid JSON object cannot be extracted or parsed from the text.
 */
const safeJsonParse = <T>(text: string): T => {
    // Attempt to find JSON within markdown code fences.
    // This regex looks for ```json or ```, followed by any characters (non-greedy), and a closing ```.
    const match = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);

    let jsonText;
    if (match && match[1]) {
        // If we found a markdown block, use its content.
        jsonText = match[1];
    } else {
        // If no markdown block is found, assume the whole text might be JSON,
        // or JSON is embedded in it. We'll find the first '{' and last '}'
        // to be more resilient to conversational text around the object.
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            jsonText = text.substring(firstBrace, lastBrace + 1);
        } else {
            // If we can't find even a basic object structure, we have to fail.
             throw new Error("Could not extract a valid JSON object from the AI's response.");
        }
    }

    try {
        return JSON.parse(jsonText) as T;
    } catch (e) {
        console.error("Failed to parse extracted JSON text:", jsonText);
        throw new Error(`AI returned a malformed JSON response. The model's output could not be parsed. Original text: ${text}`);
    }
}


/**
 * The unified, professional persona for the AI across the entire application.
 * This establishes a consistent tone and level of expertise.
 */
const AI_PERSONA_BASE = "You are an Elite ESG Strategist and AI Consultant, equivalent to a principal at a top-tier firm like McKinsey, BCG, or Bain. You specialize in sustainable development, digital transformation, and creating high-impact, investment-grade strategies. Your analysis is always sharp, data-driven, and forward-looking. You communicate with the clarity and authority of a seasoned executive advisor.";


/**
 * Generates a structured roadmap by streaming the response from the Gemini API.
 * This approach provides real-time feedback to the user, showing the AI's response
 * as it's being constructed.
 * 
 * @param {string} userPrompt - The main prompt from the user describing the desired roadmap.
 * @param {string} context - A string containing additional context from user-uploaded files.
 * @param {StreamCallbacks} callbacks - An object containing onChunk, onComplete, and onError callbacks to handle the stream.
 * @returns {Promise<void>} A promise that resolves when the streaming is complete or an error occurs.
 */
export const generateRoadmapStream = async (
  userPrompt: string, 
  context: string,
  { onChunk, onComplete, onError }: StreamCallbacks
): Promise<void> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `${AI_PERSONA_BASE} Your mission is to transform a user's request into a professional, actionable, and strategic blueprint for a social or environmental impact project. Critically analyze the user's goal, applying ESG principles and strategic foresight. Use your web search tool extensively to find and cite reliable, high-quality sources (academic papers, official documentation, reputable articles) to ground your recommendations. Your output must be a single, well-structured JSON object that strictly adheres to the provided schema. Do not add any conversational text or markdown formatting around the JSON output.`;
    
    const fullPrompt = `
      **Analysis & Task:**
      1.  **Deconstruct the Request:** Analyze the user's prompt and the provided context below. Identify the core objective, key constraints, and desired impact.
      2.  **Strategic Formulation:** Think step-by-step. Formulate a logical, phased approach to achieve the objective. Each step (node) must be a distinct, meaningful part of the overall strategy.
      3.  **Generate Blueprint:** Construct a comprehensive Blueprint Roadmap in the required JSON format. Ensure every node has a clear purpose, detailed content, and a strategic rationale. Use your web search to find relevant data, case studies, and best practices to incorporate.

      **CONTEXT FROM PROVIDED DOCUMENTS:**
      ---
      ${context || "No context provided. Base the roadmap solely on the user's request and your web search results."}
      ---

      **USER'S ROADMAP REQUEST:**
      ---
      "${userPrompt}"
      ---

      **INSTRUCTIONS & REQUIRED JSON SCHEMA:**
      Generate the roadmap. The entire response must be a single JSON object conforming EXACTLY to the following schema. Do NOT add any extra text or formatting.
      Schema:
      {
        "title": "The main title of the entire roadmap.",
        "description": "A brief, one-paragraph overview of the roadmap's purpose.",
        "nodes": [
          {
            "id": "A unique identifier for the node (e.g., 'node-1', 'discovery-phase').",
            "title": "A concise title for this roadmap node.",
            "content": "Detailed description of this node using rich Markdown formatting. Use lists, bold/italic text, and clear paragraphs to explain tasks, goals, and key activities.",
            "rationale": "A concise, strategic justification explaining WHY this node is critical for the project's success and what risks it mitigates.",
            "references": ["An array of URLs or source identifiers that support this node's content, found via web search."],
            "connections": ["An array of node IDs that this node logically connects to, representing the flow of the roadmap."]
          }
        ]
      }
    `;
    
    let fullText = '';
    
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
        tools: [{googleSearch: {}}],
      },
    });

    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onChunk(chunkText);
      }
    }
    
    onComplete(fullText);

  } catch (error) {
    console.error("Gemini API stream or data processing failed:", error);
    if (error instanceof SyntaxError) {
        onError(new Error("AI returned a malformed JSON response. The model's output could not be parsed."));
    } else {
      onError(error instanceof Error ? error : new Error("Failed to generate roadmap. An unknown error occurred."));
    }
  }
};

/**
 * Parses the final, streamed text to extract the roadmap JSON.
 * 
 * @param {string} fullText - The complete string response from the AI after the stream has ended.
 * @returns {GeneratedRoadmap} The parsed `GeneratedRoadmap` object.
 * @throws {Error} An error if JSON cannot be extracted or parsed, or if the structure is invalid.
 */
export const processStreamedResponse = (fullText: string): GeneratedRoadmap => {
    const roadmapData = safeJsonParse<Omit<GeneratedRoadmap, 'sources'>>(fullText);
    if (!roadmapData || !roadmapData.title || !Array.isArray(roadmapData.nodes)) {
      throw new Error("AI failed to generate a valid roadmap structure. The response was missing critical fields like title or nodes.");
    }
    return { ...roadmapData, sources: [] };
}

/**
 * Generates an ESG analytics report using a non-streaming call to the Gemini API.
 * @param {string} projectDescription - A description of the project or organization.
 * @returns {Promise<AnalyticsReport>} A promise that resolves to an `AnalyticsReport` object.
 */
export const generateAnalyticsReport = async (projectDescription: string): Promise<AnalyticsReport> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const fullPrompt = `
        Please generate a comprehensive ESG analysis based on the following project description.
        The entire response must be a single JSON object conforming EXACTLY to the schema provided below. Do NOT add any extra text, conversation, or markdown formatting.

        **Project Description:**
        ---
        ${projectDescription}
        ---

        **Required JSON Schema:**
        {
          "overallScore": 100,
          "summary": "A concise, professional summary of the ESG analysis.",
          "risksAndOpportunities": "An executive summary in Markdown, identifying the top 3 ESG risks and top 3 ESG opportunities for this project.",
          "carbonFootprint": {
            "scope1": 0,
            "scope2": 0,
            "scope3": 0,
            "unit": "tCO2e",
            "methodology": "A brief, transparent explanation of the estimation methodology, citing any benchmarks used.",
            "confidenceScore": "Medium",
            "confidenceRationale": "A brief justification for the confidence score."
          },
          "metrics": [
            {
              "name": "Name of a relevant ESG Key Performance Indicator (KPI).",
              "value": "An estimated value or benchmark for the KPI.",
              "category": "Environmental",
              "insight": "A brief insight or suggestion related to this metric."
            }
          ],
          "draftReportMarkdown": "A well-structured draft of a simple ESG report in Markdown format, including sections for each ESG pillar.",
          "recommendations": "A list of 3-5 actionable recommendations for improving the project's ESG performance, in Markdown format."
        }
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
            systemInstruction: `${AI_PERSONA_BASE} You are now acting as a Quantitative ESG Analyst. Your task is to provide an estimated ESG analysis based on a user's project description. You must use your web search tool to find relevant data for estimations (e.g., industry benchmarks for emissions). Your entire output must be a single, valid JSON object adhering to the schema provided in the user prompt. Do not add any other text.`,
            tools: [{googleSearch: {}}],
            temperature: 0.2,
        }
    });

    return safeJsonParse<AnalyticsReport>(response.text);
};


/**
 * Answers a user's question about ESG using a streaming response.
 * @param {string} question - The user's question.
 * @param {StreamCallbacks} callbacks - Callbacks to handle the streaming response.
 * @returns {Promise<void>} A promise that resolves when the stream is complete.
 */
export const answerEsgQuestion = async (question: string, callbacks: StreamCallbacks): Promise<void> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: question,
            config: {
                systemInstruction: `${AI_PERSONA_BASE} You are now acting as an ESG Research Lead. Your mission is to provide clear, accurate, and comprehensive answers to user questions. You MUST use your web search tool to find and cite reliable, high-quality sources. Structure your answer in rich Markdown. Start with a 'Key Takeaways' section. Crucially, provide a balanced view, presenting potential counter-arguments or alternative perspectives where applicable to give a full, nuanced picture.`,
                tools: [{googleSearch: {}}]
            }
        });

        let fullText = '';
        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (chunkText) {
                fullText += chunkText;
                callbacks.onChunk(chunkText);
            }
        }
        callbacks.onComplete(fullText);
    } catch (error) {
        console.error("Gemini question answering failed:", error);
        callbacks.onError(error instanceof Error ? error : new Error("Failed to get an answer."));
    }
};

/**
 * Generates an ESG compliance report for a given regulation and context.
 * @param {string} regulation - The name of the ESG regulation (e.g., "CSRD").
 * @param {string} context - A description of the user's organization.
 * @returns {Promise<ComplianceReport>} A promise that resolves to a `ComplianceReport` object.
 */
export const generateComplianceReport = async (regulation: string, context: string): Promise<ComplianceReport> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fullPrompt = `
        Based on the provided regulation and organizational context, generate a detailed compliance package.
        The entire response must be a single JSON object conforming EXACTLY to the schema provided below. Do NOT add any extra text, conversation, or markdown formatting.

        **Regulation:** "${regulation}"
        
        **Organization Context:**
        ---
        ${context}
        ---

        **Required JSON Schema:**
        {
          "regulation": "The full name of the regulation.",
          "summaryOfObligations": "A high-level summary of the key obligations under this regulation for an organization of this type, in Markdown format.",
          "strategicImplicationsMarkdown": "An analysis of the strategic implications (risks, opportunities, business model impact) of this regulation for the organization, in Markdown format.",
          "checklistMarkdown": "A detailed, actionable compliance checklist in Markdown format, with steps organized logically.",
          "draftDocumentMarkdown": "A draft of a key compliance document (e.g., a policy statement or disclosure section) relevant to the regulation, in Markdown format.",
          "materialityMatrixMarkdown": "An AI-generated materiality matrix in a Markdown table format, identifying and prioritizing relevant ESG topics."
        }
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
            systemInstruction: `${AI_PERSONA_BASE} You are now acting as a Regulatory Compliance Specialist. Based on the provided regulation and organizational context, generate a detailed compliance package. Go beyond a simple checklist. Analyze the potential strategic business implications of this regulation. Use your web search tool for specific details about the regulation to ensure accuracy. Your entire output must be a single, valid JSON object adhering to the schema in the user prompt. Do not add any other text.`,
            tools: [{googleSearch: {}}],
            temperature: 0.2,
        }
    });

    return safeJsonParse<ComplianceReport>(response.text);
};