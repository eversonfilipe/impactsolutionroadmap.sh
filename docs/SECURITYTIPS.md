# Security & Privacy at ImpactSolutionRoadmap.sh

Your trust is our top priority. This document outlines the security and data privacy model of `ImpactSolutionRoadmap.sh` and provides essential tips for using the application safely and responsibly.

## Our Security Philosophy: Privacy-First & Client-Side

`ImpactSolutionRoadmap.sh` is designed with a "privacy-first" architecture. Here’s what that means for you:

-   **No Server, No Database:** The application runs entirely within your web browser. We do not operate a backend server to process or store your data. There are no user accounts to create or manage.
-   **Your Data Stays With You:** All the roadmaps you generate and save are stored exclusively in your browser's `localStorage`. This data resides on your computer and is never transmitted to us or any third party.

## The Data Flow: What Happens to Your Information?

When you use the application, your data follows a clear and direct path:

1.  **Your Prompt & Context Files:** The roadmap goal you write and the content of any files you upload are sent securely over HTTPS directly to the Google Gemini API for processing. The project maintainers **never** see or have access to this information. For details on how Google handles this data, please refer to the [Google AI Privacy Policy](https://policies.google.com/privacy).
2.  **The Generated Roadmap:** The AI's response is streamed back directly to your browser.
3.  **Saving to History:** When you click "Save," the complete roadmap data is stored in your browser's `localStorage`. This data does not leave your machine.

## Best Practices for Secure Usage

While the application is designed to be secure, your vigilance is key to protecting your information. Please follow these best practices:

### 1. **Do Not Input Sensitive Information**
As a general rule for any online AI service, avoid entering highly sensitive, confidential, or personally identifiable information (PII). This includes:
-   Private financial data
-   Personal health information
-   Confidential business information

While the connection to the API is encrypted, it is a best practice to treat AI prompts as semi-public and sanitize your inputs.

### 2. **Be Mindful of Shared Computers**
Because your saved roadmap history is stored in `localStorage`, it is tied to the specific browser profile on the computer you are using.
-   If you use a public or shared computer (e.g., in a library or university), other users of that same computer and browser profile could potentially access your saved history.
-   **Recommendation:** If using a shared device, either avoid saving roadmaps to history or remember to clear your browser's site data after your session is complete.

### 3. **Critically Evaluate AI-Generated Content**
The AI uses Google Search to ground its responses in real-world information and often provides sources. However, AI is not infallible.
-   **Always verify:** Independently check the facts, figures, and sources provided in your roadmap before making critical decisions based on them.
-   **AI can "hallucinate":** It may occasionally generate plausible-sounding but incorrect information. Treat the generated roadmap as a powerful, well-researched first draft that requires your expert review.

### 4. **Use a Secure Browser Environment**
Ensure you are using an up-to-date, reputable web browser. Be cautious about the browser extensions you install, as poorly-coded or malicious extensions could potentially compromise your browser's security.

## Reporting a Security Concern

If you believe you have discovered a security vulnerability in the application itself, please report it to us by opening an issue on our [GitHub repository](https://github.com/your-repo/impactsolutionroadmap). Please provide a detailed description of the issue so we can investigate it promptly.

Thank you for helping us maintain a safe and secure environment for all users.