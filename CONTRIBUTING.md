# Contributing to ImpactSolutionRoadmap.sh

First and foremost, thank you for considering contributing. This project thrives on community involvement, and every contribution, from a small typo fix to a major new feature, is invaluable. We are excited to build a tool that can make a real-world impact, and your help is crucial.

This document provides guidelines for contributing to the project. Please read it carefully to ensure a smooth and effective collaboration process.

## Code of Conduct

We are committed to fostering a welcoming, inclusive, and professional environment. All participants are expected to read and adhere to our [**Code of Conduct**](./CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## How Can I Contribute?

There are many ways to contribute to the project's success:

-   **Reporting Bugs:** If you find a bug, please [open an issue](https://github.com/eversonfilipe/impactsolutionroadmap.sh/issues). A great bug report includes a clear title, a detailed description of the problem, steps to reproduce it, and what you expected to happen.
-   **Suggesting Enhancements:** Have an idea for a new feature or an improvement? Open an issue with a clear description of your suggestion and why it would be valuable for our users.
-   **Improving Documentation:** Clear documentation is essential for a healthy open-source project. If you find areas for improvement in our `README.md` or any file in the `/docs` folder, please don't hesitate to submit a pull request.
-   **Writing Code:** If you're ready to write some code, you can start by looking at issues tagged with `good first issue` or `help wanted`.

## Your First Code Contribution

Ready to dive in? Here’s a step-by-step guide to making your first code contribution.

### 1. Set Up Your Environment

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/impactsolutionroadmap.sh.git
    cd impactsolutionroadmap.sh
    ```
3.  **Project Setup (Recommended):** This project is a modern, static web application. For the best development experience, a build tool that handles dependencies and environment variables is strongly recommended.
    *   You will need a Google Gemini API key. Create a file named `.env` in the root of the project and add your key:
        ```
        API_KEY=YOUR_GEMINI_API_KEY
        ```
    *   A build tool like [Vite](https://vitejs.dev/) will automatically make this environment variable available in the code as `process.env.API_KEY`. Without a build tool, you would need to manually replace this variable in the code, which is not ideal for development.

### 2. Make Your Changes

1.  **Create a new branch** for your feature or bug fix. Use a descriptive, kebab-case name:
    ```bash
    git checkout -b feat/add-new-export-format
    ```
2.  **Write your code.** Please adhere to the existing code style, architecture, and conventions.
    *   **Architecture:** Review the [**Technical Architecture Guide**](./docs/TECHNICAL_ARCHITECTURE.md) to understand the project structure.
    *   **Component Structure:** Components are located in `/components`. Keep them focused, reusable, and well-documented with JSDoc comments.
    *   **Styling:** We use Tailwind CSS for all styling. Please use its utility classes.
    *   **Types:** TypeScript is used for type safety. Define shared types in `types.ts` or locally within a component where appropriate.
3.  **Commit your changes** with a clear and concise commit message. We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
    ```bash
    git commit -m "feat: Add PDF export option to RoadmapDisplay component"
    ```

### 3. Submit a Pull Request

1.  **Push your branch** to your fork on GitHub:
    ```bash
    git push origin feat/add-new-export-format
    ```
2.  **Open a Pull Request (PR)** from your branch to the `main` branch of the original repository.
3.  **Write a clear PR description.** Explain the "what" and "why" of your changes. If your PR fixes an existing issue, link to it (e.g., "Closes #123").

## Pull Request Review

Once your PR is submitted, a project maintainer will review it. We aim to be responsive and collaborative. We may ask for changes to ensure code quality, consistency, and alignment with the project's goals.

Thank you again for your interest in making `ImpactSolutionRoadmap.sh` better!
