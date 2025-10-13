# Technical Architecture Overview

This document provides a high-level overview of the technical architecture for `ImpactSolutionRoadmap.sh`. It is intended for developers and contributors who want to understand the design principles, structure, and data flow of the application.

## Core Architectural Principles

The application is built on a set of core principles that guide its design and development:

1.  **Privacy First via Client-Side Architecture:** The entire application runs in the user's web browser. There is no backend server, no database, and no user accounts. This is a deliberate choice to guarantee user privacy. All data, including prompts, uploaded files, and saved roadmaps, is either processed in-memory or stored exclusively in the browser's `localStorage`.
2.  **Serverless & Infinitely Scalable:** By avoiding a backend, the application has zero server maintenance overhead and can be deployed to any static hosting provider (e.g., GitHub Pages, Vercel, Netlify). It scales to any number of users without incurring server costs.
3.  **Modularity & Maintainability:** The codebase is organized into a clear, component-based structure. Logic is separated by concern (UI, API services, utilities), making the application easier to understand, maintain, and extend.
4.  **Modern & Standardized Tooling:** The project uses a minimal but powerful set of modern, widely-adopted technologies (React, TypeScript, Tailwind CSS) to ensure a high-quality codebase and a smooth developer experience.

---

## High-Level Component Structure

The application's UI is built with React and follows a logical component hierarchy.

```
App.tsx
├── Header.tsx
├── Navigation.tsx
├── HistoryPanel.tsx (Conditional)
└── views/
    ├── RoadmapGeneratorView.tsx
    │   ├── PromptForm.tsx
    │   ├── StreamingResponseDisplay.tsx (Conditional)
    │   └── RoadmapDisplay.tsx (Conditional)
    │       ├── ProgressBar.tsx
    │       └── ... (NodeCard, etc.)
    ├── AnalyticsHubView.tsx
    ├── KnowledgeBaseView.tsx
    └── ComplianceEngineView.tsx
```

-   **`App.tsx` (The Controller):** This is the root component. It acts as the master controller for the application's state, including the active view (`AppView`), the `roadmapHistory`, the active roadmap, and the PWA installation prompt. It passes state and callbacks down to the view components.

-   **`components/views/*.tsx` (The Views):** Each of the four main application modules has its own dedicated view component. These components are responsible for orchestrating the UI and logic for a specific feature (e.g., `RoadmapGeneratorView` handles the entire roadmap creation lifecycle).

-   **Reusable Components (`components/*.tsx`):** Common UI elements like `Header`, `Navigation`, `PromptForm`, and `RoadmapDisplay` are built as reusable components to ensure consistency and a DRY (Don't Repeat Yourself) codebase.

-   **Icons (`components/icons/*.tsx`):** All SVG icons are self-contained functional components for easy use and maintenance.

---

## State Management

For an application of this scope, we use React's built-in Hooks for state management (`useState`, `useEffect`, `useCallback`).

-   **Centralized State in `App.tsx`:** The most critical global state (the list of saved roadmaps) is "lifted up" to the `App.tsx` component. This provides a single source of truth.
-   **Prop Drilling:** State and the functions to modify it are passed down to child components via props. This approach is simple, explicit, and sufficient for the current complexity of the application, avoiding the need for a heavier state management library like Redux or Zustand.
-   **Local Component State:** State that is only relevant to a single component (e.g., the value of an input field in a form) is kept local to that component using `useState`.

## Services and Utilities

Logic that is not directly related to rendering UI is abstracted into separate services and utility modules.

### `services/geminiService.ts`

This is the heart of the AI integration. It is the *only* module in the application that communicates with the external Google Gemini API.

-   **Encapsulation:** All API keys, prompt engineering logic, and API call mechanics are encapsulated here. If we were to switch to a different LLM provider, this would be the primary file to modify.
-   **Prompt Engineering:** This service contains the sophisticated system instructions, AI persona definitions, and JSON schema descriptions that guide the AI's behavior, ensuring high-quality, structured output.
-   **Robust Parsing:** It includes the `safeJsonParse` function, a critical utility designed to reliably extract a valid JSON object from the AI's potentially "messy" raw text response.

### `utils/fileReader.ts`

This module contains the logic for handling user file uploads.

-   It uses the browser's `FileReader` API for text-based files.
-   It integrates `pdfjs-dist` to handle PDF files, extracting their text content.
-   This separation of concerns keeps the component code cleaner and focused on UI logic.

## Progressive Web App (PWA) Functionality

The application is enhanced with PWA capabilities to provide a more native-like experience.

-   **`manifest.json`:** Provides the metadata for the application (name, icons, theme colors) that allows it to be installed on a user's device.
-   **`sw.js` (Service Worker):** A simple service worker is used to cache the core application shell (`index.html`, etc.). This enables the application to load instantly on subsequent visits and to function even when the