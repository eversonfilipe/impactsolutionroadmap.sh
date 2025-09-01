# ImpactSolutionRoadmap.sh

**Transforming complex social and environmental problems into actionable, collaborative blueprints.**

This project is an open-source, AI-powered platform designed to generate professional roadmaps for impact projects. It democratizes technology as a force for good, providing a tool for entrepreneurs, NGOs, researchers, and developers to architect and implement solutions for social and environmental challenges.

## Core Features

-   **AI-Powered Generation**: Leverages Google's Gemini API to create detailed, structured roadmaps from a simple prompt.
-   **Context-Aware**: Users can upload documents (.txt, .md, etc.) to provide the AI with specific context, ensuring more accurate and relevant blueprints.
-   **Live Progress**: Watch the AI build your roadmap in real-time with a streaming response display.
-   **Progress Tracking**: Mark roadmap steps as complete and visualize your progress with a dynamic progress bar.
-   **Versioning & History**: Save, load, and manage different versions of your roadmaps directly in your browser.
-   **Data Privacy**: All data, including uploaded files and generated roadmaps, is processed locally. Your work is stored only in your browser's `localStorage`.
-   **Exportable**: Download your complete roadmap as a Markdown file to use in other tools or share with your team.
-   **100% Free & Open-Source**: Built under the MIT license, this tool is completely free, non-commercial, and community-driven.

## Technology Stack

-   **AI Engine**: Google Gemini API (`gemini-2.5-flash`) via `@google/genai` SDK.
-   **Frontend**: React (with Hooks) for a dynamic user interface.
-   **Styling**: Tailwind CSS for a utility-first, responsive design.
-   **Markdown Parsing**: `marked` and `DOMPurify` for secure and rich text rendering.
-   **Deployment**: Designed for static hosting platforms like GitHub Pages, Vercel, or Netlify.

## Getting Started

This project is a static web application and requires no backend server.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/impactsolutionroadmap.sh
    cd impactsolutionroadmap.sh
    ```

2.  **API Key Setup:**
    This project is designed to use an API key from an environment variable (`process.env.API_KEY`) as per the official Google AI SDK guidelines. For local development or deployment, you will need to set up a build process (e.g., using Vite or Create React App) that can handle environment variables. You would typically create a `.env` file in the root of your project:
    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```
    *Note: The current file structure is a simplified proof-of-concept. Integrating a build tool is the next step for robust local development.*

3.  **Open `index.html`:**
    For a quick preview without a build step, you can use a live server extension in your code editor (like Live Server for VS Code) to serve the `index.html` file.

## How to Contribute

We welcome contributions from everyone! Whether it's improving the UI, adding new features, or enhancing the documentation, your help is valuable.

1.  **Fork the repository.**
2.  **Create a new branch** (`git checkout -b feature/your-feature-name`).
3.  **Make your changes.**
4.  **Commit your changes** (`git commit -m 'Add some amazing feature'`).
5.  **Push to the branch** (`git push origin feature/your-feature-name`).
6.  **Open a Pull Request.**

Please read our `docs/GUIDE.md` and `docs/TIPS.md` for more information on using the application.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
