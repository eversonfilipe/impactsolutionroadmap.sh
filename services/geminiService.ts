import { GoogleGenAI, Type } from "@google/genai";
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
 * A helper function to safely parse JSON from a string,
 * cleaning it of markdown wrappers first.
 * @param text The raw text from the AI.
 * @returns A parsed JSON object.
 */
const safeJsonParse = <T>(text: string): T => {
    let jsonText = text.trim();
    // This regex is more robust and handles optional "json" language identifier.
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1];
    }

    if (!jsonText) {
      throw new Error("Could not extract JSON from the AI's final response.");
    }
    
    return JSON.parse(jsonText) as T;
}

/**
 * Generates a structured roadmap by streaming the response from the Gemini API.
 * This approach provides real-time feedback to the user, showing the AI's response
 * as it's being constructed.
 * 
 * @param userPrompt - The main prompt from the user describing the desired roadmap.
 * @param context - A string containing additional context from user-uploaded files.
 * @param callbacks - An object containing onChunk, onComplete, and onError callbacks to handle the stream.
 */
export const generateRoadmapStream = async (
  userPrompt: string, 
  context: string,
  { onChunk, onComplete, onError }: StreamCallbacks
): Promise<void> => {
  try {
    // This comment explains the rationale for the prompt structure, aiding open-source contributions.
    // The prompt is engineered to be highly specific, providing the AI with a clear role, task, context, and a strict output format.
    // This "Role-Task-Context-Format" structure is crucial for achieving consistent, high-quality JSON output.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const schemaDefinition = `
      "title": "The main title of the entire roadmap.",
      "description": "A brief, one-paragraph overview of the roadmap's purpose.",
      "nodes": [
        {
          "id": "A unique identifier for the node (e.g., 'node-1', 'discovery-phase').",
          "title": "A concise title for this roadmap node.",
          "content": "Detailed description of this node using rich Markdown formatting. Use lists, bold/italic text, and clear paragraphs to explain tasks, goals, and key activities.",
          "references": ["An array of URLs or source identifiers that support this node's content, preferably found via web search."],
          "connections": ["An array of node IDs that this node logically connects to, representing the flow of the roadmap."]
        }
      ]
    `;

    const systemInstruction = `You are an Elite Senior Software Engineer and Impact Strategist. Your mission is to create professional, functional, secure, optimized, and strategic roadmaps for social and environmental impact projects. You MUST use your web search tool to find and cite reliable, high-quality sources (academic papers, official documentation, reputable articles) to back up your recommendations in the roadmap. Your output must be a single, well-structured JSON object that strictly adheres to the provided schema. Do not add any conversational text or markdown formatting around the JSON output.`;
    
    const fullPrompt = `
      Based on the context provided below and the user's request, please generate a comprehensive and actionable Blueprint Roadmap. Use your search capabilities to ensure all information is up-to-date and references are valid.

      **CONTEXT FROM PROVIDED DOCUMENTS:**
      ---
      ${context || "No context provided. Base the roadmap solely on the user's request and your web search results."}
      ---

      **USER'S ROADMAP REQUEST:**
      ---
      "${userPrompt}"
      ---

      **INSTRUCTIONS & REQUIRED JSON SCHEMA:**
      Generate the roadmap. The entire response must be a single JSON object conforming EXACTLY to the following schema. Do NOT add any extra text or formatting before or after the JSON object. The schema is: { ${schemaDefinition} }
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
 * @param fullText - The complete string response from the AI after the stream has ended.
 * @returns The parsed `GeneratedRoadmap` object.
 * @throws An error if JSON cannot be extracted or parsed.
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
 * @param projectDescription - A description of the project or organization.
 * @returns A promise that resolves to an `AnalyticsReport` object.
 */
export const generateAnalyticsReport = async (projectDescription: string): Promise<AnalyticsReport> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on the following project description, generate a comprehensive ESG analysis.
        
        **Project Description:**
        ---
        ${projectDescription}
        ---
        `,
        config: {
            systemInstruction: "You are a professional ESG analyst and sustainability consultant. Your task is to provide an estimated ESG analysis based on a user's project description. You must use your web search tool to find relevant data for estimations (e.g., industry benchmarks for emissions). Your entire output must be a single, valid JSON object adhering to the provided schema. Do not add any other text.",
            tools: [{googleSearch: {}}],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    overallScore: { type: Type.INTEGER, description: "An overall ESG score from 0 to 100, reflecting the project's estimated impact." },
                    summary: { type: Type.STRING, description: "A concise, professional summary of the ESG analysis." },
                    carbonFootprint: {
                        type: Type.OBJECT,
                        properties: {
                            scope1: { type: Type.NUMBER, description: "Estimated Scope 1 emissions in tonnes of CO2 equivalent (tCO2e)." },
                            scope2: { type: Type.NUMBER, description: "Estimated Scope 2 emissions in tCO2e." },
                            scope3: { type: Type.NUMBER, description: "Estimated Scope 3 emissions in tCO2e." },
                            unit: { type: Type.STRING, description: "Unit of measurement, which must be 'tCO2e'."},
                            methodology: { type: Type.STRING, description: "A brief, transparent explanation of the estimation methodology, citing any benchmarks used."}
                        },
                        required: ["scope1", "scope2", "scope3", "unit", "methodology"]
                    },
                    metrics: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "Name of a relevant ESG Key Performance Indicator (KPI)." },
                                value: { type: Type.STRING, description: "An estimated value or benchmark for the KPI." },
                                category: { type: Type.STRING, enum: ["Environmental", "Social", "Governance"] },
                                insight: { type: Type.STRING, description: "A brief insight or suggestion related to this metric." }
                            },
                             required: ["name", "value", "category", "insight"]
                        }
                    },
                    draftReportMarkdown: { type: Type.STRING, description: "A well-structured draft of a simple ESG report in Markdown format, including sections for each ESG pillar." },
                    recommendations: { type: Type.STRING, description: "A list of 3-5 actionable recommendations for improving the project's ESG performance, in Markdown format." }
                },
                required: ["overallScore", "summary", "carbonFootprint", "metrics", "draftReportMarkdown", "recommendations"]
            }
        }
    });

    return safeJsonParse<AnalyticsReport>(response.text);
};


/**
 * Answers a user's question about ESG using a streaming response.
 * @param question - The user's question.
 * @param callbacks - Callbacks to handle the streaming response.
 */
export const answerEsgQuestion = async (question: string, callbacks: StreamCallbacks): Promise<void> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: question,
            config: {
                systemInstruction: "You are a world-class expert on ESG frameworks, methodologies, and best practices. Your mission is to provide clear, accurate, and comprehensive answers to user questions. You MUST use your web search tool to find and cite reliable, high-quality sources (academic papers, official documentation, reputable articles) in your response. Structure your answer in rich Markdown. Start with a 'Key Takeaways' section summarizing the main points before the full explanation.",
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
 * @param regulation - The name of the ESG regulation (e.g., "CSRD").
 * @param context - A description of the user's organization.
 * @returns A promise that resolves to a `ComplianceReport` object.
 */
export const generateComplianceReport = async (regulation: string, context: string): Promise<ComplianceReport> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
            Regulation: "${regulation}"
            
            Organization Context:
            ---
            ${context}
            ---
        `,
        config: {
            systemInstruction: "You are a specialist in global ESG regulations and compliance. Based on the provided regulation and organizational context, generate a detailed compliance package. Use your web search tool for specific details about the regulation to ensure accuracy. Your entire output must be a single, valid JSON object adhering to the schema. Do not add any other text.",
            tools: [{googleSearch: {}}],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    regulation: { type: Type.STRING, description: "The full name of the regulation." },
                    summaryOfObligations: { type: Type.STRING, description: "A high-level summary of the key obligations under this regulation for an organization of this type, in Markdown format."},
                    checklistMarkdown: { type: Type.STRING, description: "A detailed, actionable compliance checklist in Markdown format, with steps organized logically."},
                    draftDocumentMarkdown: { type: Type.STRING, description: "A draft of a key compliance document (e.g., a policy statement or disclosure section) relevant to the regulation, in Markdown format."},
                    materialityMatrixMarkdown: { type: Type.STRING, description: "An AI-generated materiality matrix in a Markdown table format, identifying and prioritizing relevant ESG topics."}
                },
                required: ["regulation", "summaryOfObligations", "checklistMarkdown", "draftDocumentMarkdown", "materialityMatrixMarkdown"]
            }
        }
    });

    return safeJsonParse<ComplianceReport>(response.text);
};