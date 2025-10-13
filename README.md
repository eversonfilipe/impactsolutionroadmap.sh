<img width="1897" height="965" alt="Captura de tela 2025-09-01 132018" src="https://github.com/user-attachments/assets/c4976e78-d076-45a6-9592-62167560c2b3" alt="Print da primeira tela da aplicação logo após Roadmap ser gerado."/>

# ImpactSolutionRoadmap.sh

**Transforming complex social and environmental problems into actionable, collaborative blueprints.**

This project is an open-source, AI-powered platform designed to generate professional roadmaps for impact projects. It democratizes technology as a force for good, providing a tool for entrepreneurs, NGOs, researchers, and developers to architect and implement solutions for social and environmental challenges.

## Core Features

-   **AI-Powered Generation**: Leverages Google's Gemini API to create detailed, structured roadmaps from a simple prompt.
-   **ESG Analytics Hub**: Generate estimated carbon footprints, ESG scores, and draft sustainability reports based on your project descriptions.
-   **Collaborative Knowledge Base**: Ask the AI complex questions about ESG frameworks and methodologies to get grounded, well-referenced answers.
-   **Smart Compliance Engine**: Automatically generate compliance checklists and documentation drafts for major ESG regulations like CSRD and TCFD.
-   **Context-Aware**: Upload documents (.txt, .md, .pdf) to provide the AI with specific context, ensuring more accurate and relevant blueprints.
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

<img width="1891" height="966" alt="Captura de tela 2025-09-01 132052" src="https://github.com/user-attachments/assets/5d6c6e08-d372-4a5e-a80f-6c490e4e6d78" alt="Print ilustrativo da última parte do Roadmap gerado."/>

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

---
<br>

## Keywords

open-source, ai-powered, impact projects, roadmap, esg, govtech, éverson filipe, everson filipe, everson felipe, ai for good, artificial intelligence, product management, product strategy, venture building, lean startup, design thinking, scrum, metodologias ágeis, mvp, prototipagem, validação de produto, product-market fit, growth mindset, no-code, low-code, blockchain, iot, inovação social, impacto socioambiental, tecnologia com propósito, startups de impacto, empreendedorismo social, desenvolvimento sustentável, ods, agenda 2030, tech for good, cidades inteligentes, mobilidade urbana, logística inteligente, responsabilidade social, sustentabilidade corporativa, políticas públicas, governo digital, ecossistema de startups, hubs de inovação, brasil, américa latina, latam, porto digital, wadhwani foundation, aceleradoras, incubadoras, mentoria de startups, venture capital, angel investor, fundraising, desenvolvimento regional, parcerias estratégicas, co-criação, engenharia de prompts, estratégias de conteúdo, impacto social em larga escala, growth hacking para impacto, marketing de impacto, engajamento comunitário, comunidade open-source, liderança de pensamento, storytelling de impacto, validação de mercado, pitch de startups, venture for good, economia de impacto, aceleração de ecossistemas, inovação colaborativa, parcerias público-privadas, soft skills para fundadores, hard skills para impacto, análise de dados de impacto, métricas de sucesso, go-to-market para esg, sustentabilidade digital, futurismo, tendências de inovação, empreendedorismo regenerativo, capital de risco para impacto, educação empreendedora, transformação digital, propósito de marca, human-centered design, frameworks para startups, guia de negócios, planejamento estratégico, crescimento exponencial, tração de mercado, captação de investimento, unicórnios, escalabilidade, inovação disruptiva, liderança empreendedora, cultura de startup, resiliência, automação de processos, prototipagem rápida, growth hacking, marketing digital, marketing de conteúdo, seo para startups, analytics, business intelligence, dashboards de performance, métricas de vaidade, kpi's, okr's, ciclo de feedback, experiência do cliente (cx), user experience (ux), user interface (ui), design centrado no usuário, pesquisa de usuário, economia circular, energias renováveis, soluções hídricas, agricultura sustentável, biotecnologia, nanotecnologia, healthtech, edtech, fintech, civic tech, tecnologia na américa latina, ecossistema brasileiro de inovação, polo tecnológico, parques tecnológicos, incubadoras, aceleradoras, fundos de venture capital, corporate venture, investidores anjo, pitch, elevator pitch, comunicação persuasiva, storytelling, marca pessoal, autoridade digital, networking, eventos de startups, ética em IA, governança de dados, lgpd, segurança cibernética, cloud computing, transformação digital, empreendedorismo feminino, diversidade e inclusão, liderança jovem, soft skills, resolução de problemas complexos, pensamento sistêmico, tomada de decisão baseada em dados, inovação aberta, colaboração remota, futuro do trabalho, mentorias, programas de aceleração, cases de sucesso, estudo de mercado, análise competitiva, modelo de negócio canvas, proposta de valor, público-alvo, jornada do cliente, canais de distribuição, fontes de receita, estrutura de custos, financiamento.
