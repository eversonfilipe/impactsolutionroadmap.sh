# Contributing to ImpactSolutionRoadmap.sh

First off, thank you for considering contributing! This project thrives on community involvement, and every contribution, from a small typo fix to a major new feature, is invaluable. We are excited to build a tool that can make a real-world impact, and your help is crucial.

This document provides guidelines for contributing to the project. Please read it carefully to ensure a smooth and effective collaboration process.

## Code of Conduct

We are committed to fostering a welcoming, inclusive, and harassment-free environment for everyone. All participants are expected to follow our **Code of Conduct**. Please take a moment to read it before you start. (Note: A formal CODE_OF_CONDUCT.md file will be added soon. In the meantime, the expectation is to interact with respect, kindness, and professionalism.)

## How Can I Contribute?

There are many ways to contribute to the project:

-   **Reporting Bugs:** If you find a bug, please open an issue in our GitHub repository. A great bug report includes a clear title, a detailed description of the problem, steps to reproduce it, and what you expected to happen.
-   **Suggesting Enhancements:** Have an idea for a new feature or an improvement to an existing one? Open an issue with a clear description of your suggestion and why it would be valuable.
-   **Improving Documentation:** Clear documentation is essential. If you find areas for improvement in our `README.md` or the files in the `/docs` folder, please don't hesitate to submit a pull request.
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
3.  **Project Setup:** This project is a static web application built with React and TypeScript. While it can be run by opening `index.html`, a proper development setup requires a build tool to handle dependencies and environment variables. We recommend using Vite.
    *   You will need to set up your Google Gemini API key. Create a file named `.env` in the root of the project and add your key:
        ```
        API_KEY=YOUR_GEMINI_API_KEY
        ```
    *   The build tool will make this environment variable available as `process.env.API_KEY`.

### 2. Make Your Changes

1.  **Create a new branch** for your feature or bug fix. Use a descriptive name:
    ```bash
    git checkout -b feature/add-new-export-format
    ```
2.  **Write your code.** Please adhere to the existing code style and conventions.
    *   **Component Structure:** Components are located in `/components`. Keep them focused and reusable.
    *   **Styling:** We use Tailwind CSS for styling. Please use its utility classes.
    *   **Types:** TypeScript is used for type safety. Define types in `types.ts` or locally within a component where appropriate.
    *   **State Management:** We use React Hooks (`useState`, `useEffect`, etc.) for state management.
3.  **Commit your changes** with a clear and concise commit message. We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
    ```bash
    git commit -m "feat: Add PDF export option to RoadmapDisplay"
    ```

### 3. Submit a Pull Request

1.  **Push your branch** to your fork on GitHub:
    ```bash
    git push origin feature/add-new-export-format
    ```
2.  **Open a Pull Request (PR)** from your branch to the `main` branch of the original repository.
3.  **Write a clear PR description.** Explain the "what" and "why" of your changes. If your PR fixes an existing issue, link to it (e.g., "Closes #123").

## Pull Request Review

Once your PR is submitted, a project maintainer will review it. We may ask for changes to ensure code quality and consistency. We appreciate your patience and collaboration during this process.

Thank you again for your interest in contributing!