# API Guide & Customization

This document provides a technical overview of the API integration in `ImpactSolutionRoadmap.sh`. It is intended for developers who wish to understand, customize, or adapt the application to use different Large Language Models (LLMs).

## Understanding the Core API: Google Gemini 2.5 Flash

The application is currently powered by Google's `gemini-2.5-flash` model, accessed via the official `@google/genai` SDK. This model was chosen for its balance of speed, capability, and advanced features.

### Key Capabilities Leveraged

1.  **Structured JSON Output**: The entire application relies on the AI's ability to return a response that strictly adheres to a predefined JSON schema. Our implementation achieves this by embedding the schema definition directly into the prompt and instructing the AI to output *only* the JSON object. This is a robust method that ensures data consistency.

2.  **Google Search Grounding**: The AI is configured with `tools: [{googleSearch: {}}]`. This empowers the model to perform real-time web searches to gather up-to-date information and find relevant sources for its recommendations. This feature is critical for generating roadmaps that are grounded in current, real-world data rather than just the model's training data.

3.  **Contextual Understanding**: The model can synthesize information from multiple sources: the user's core prompt, the content of any uploaded context files, and the results from its web search. This multi-context capability is what allows for the generation of highly personalized and relevant roadmaps.

## LLM Compatibility

While the project is built with the Gemini API, its architecture is adaptable. You can modify the application to work with any LLM API that meets one fundamental requirement:

**Core Requirement:** The LLM must be able to reliably generate structured JSON output based on a detailed prompt and system instructions.

Most modern, instruction-tuned LLMs (e.g., OpenAI's GPT series, Anthropic's Claude series, various open-source models) are capable of this. The key to success lies in adapting the prompting strategy to match the specific model's behavior.

## How to Adapt the Application for a Different LLM

If you wish to use a different AI provider, you will primarily need to modify the API service file.

### Step 1: Fork the Repository

Start by creating your own fork of the `ImpactSolutionRoadmap.sh` repository. This will give you a personal copy that you can freely modify.

### Step 2: Locate the API Service File

All the logic for communicating with the AI is centralized in a single file:

`src/services/geminiService.ts`

This is the file you will be editing.

### Step 3: Modify the API Call Logic

Inside `geminiService.ts`, find the `generateRoadmapStream` function. You will need to replace the section that uses the `@google/genai` SDK with a call to your chosen API endpoint.

**Current Logic (Simplified):**
```typescript
// Uses the Google GenAI SDK
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseStream = await ai.models.generateContentStream({
  model: "gemini-2.5-flash",
  contents: fullPrompt,
  config: { /* ... */ },
});

for await (const chunk of responseStream) {
  // processes stream
}
```

**Example Adaptation for a Different API (Conceptual):**
You would replace the above with a standard `fetch` call to your new provider's API endpoint.

```typescript
// Example for a hypothetical API endpoint
const response = await fetch('https://api.youraiprovider.com/v1/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.YOUR_API_KEY}` // Use your own API key
  },
  body: JSON.stringify({
    model: "your-model-name",
    prompt: fullPrompt, // You will need to adapt the fullPrompt structure
    stream: true,
    // Other parameters like temperature, etc.
  })
});

// You will then need to write logic to handle the streaming response
// from this new endpoint, which will differ from the @google/genai SDK.
// For non-streaming, you would await the JSON response directly.
const data = await response.json();
```

### Step 4: Adjust the Prompting Strategy

Different models respond differently to prompts. The `fullPrompt` and `systemInstruction` variables in `geminiService.ts` are highly optimized for Gemini. You will likely need to adjust them:

-   **System Prompt:** Modify the `systemInstruction` to align with the prompting conventions of your new model.
-   **Schema Definition:** The way the JSON schema is embedded in the prompt (`{ ${schemaDefinition} }`) is very effective for Gemini. Other models might prefer the schema to be described in a different format or provided in a separate parameter.

Experimentation is key. Start by sending the existing prompt structure to your new model and iterate based on the quality of the JSON output you receive.