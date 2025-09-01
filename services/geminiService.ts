import { GoogleGenAI } from "@google/genai";
import { Roadmap } from '../types';

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
    // Per official guidelines, the API key must be provided via an environment variable.
    // This avoids exposing the key in the client-side code.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // The JSON schema is embedded directly into the prompt. This is a robust strategy
    // when using tools like `googleSearch`, as `responseSchema` cannot be used alongside them.
    // It provides a strong instruction to the model on the exact output format required.
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

    // The system instruction sets the persona and high-level requirements for the AI.
    const systemInstruction = `You are an Elite Senior Software Engineer and Impact Strategist. Your mission is to create professional, functional, secure, optimized, and strategic roadmaps for social and environmental impact projects. You MUST use your web search tool to find and cite reliable, high-quality sources (academic papers, official documentation, reputable articles) to back up your recommendations in the roadmap. Your output must be a single, well-structured JSON object that strictly adheres to the provided schema. Do not add any conversational text or markdown formatting around the JSON output.`;
    
    // The final prompt assembles the user's request, context, and the strict schema instructions.
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
    
    // The `generateContentStream` call initiates the streaming connection.
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
        tools: [{googleSearch: {}}], // Enabling Google Search tool.
      },
    });

    // We iterate over the stream, accumulating text and calling the `onChunk` callback.
    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onChunk(chunkText);
      }
    }
    
    // Once the stream is finished, we call `onComplete` with the full text.
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
 * This function is responsible for cleaning up the raw AI output.
 * 
 * @param fullText - The complete string response from the AI after the stream has ended.
 * @returns The parsed `GeneratedRoadmap` object.
 * @throws An error if JSON cannot be extracted or parsed.
 */
export const processStreamedResponse = (fullText: string): GeneratedRoadmap => {
    let jsonText = fullText.trim();
    // The AI may wrap the JSON in markdown code blocks. This regex extracts the content.
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1];
    }

    if (!jsonText) {
      throw new Error("Could not extract JSON from the AI's final response.");
    }
    
    const roadmapData = JSON.parse(jsonText) as Omit<GeneratedRoadmap, 'sources'>;

    // Post-parsing validation to ensure the core structure is intact.
    if (!roadmapData || !roadmapData.title || !Array.isArray(roadmapData.nodes)) {
      throw new Error("AI failed to generate a valid roadmap structure. The response was missing critical fields like title or nodes.");
    }

    // Note: Grounding metadata (sources) from the `googleSearch` tool is not available
    // in the text stream itself. A more advanced implementation might make a second, non-streaming
    // call to retrieve this metadata. For now, we rely on references the AI embeds in the text.
    return {
      ...roadmapData,
      sources: [],
    };
}
