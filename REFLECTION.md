# Capstone Reflection

## AI SEO Audit Dashboard

Building the AI SEO Audit Dashboard helped me understand how to turn an AI-powered idea into a complete production application. I worked with Next.js, React, TypeScript, the Vercel AI SDK, and Google Gemini to create an application that collects SEO metadata and generates structured AI analysis and recommendations.

One of the most important parts of the project was making the AI integration reliable. I added URL validation, request timeouts, HTML validation, structured JSON output, score validation, and clear error responses. I also learned that an API key must be stored securely as an environment variable and configured separately for the production deployment.

Testing and accessibility were another important part of the project. I added a Vitest and React Testing Library test for the ScoreCard component. I also used Lighthouse and WAVE to identify accessibility and performance issues. The production Lighthouse audit achieved 86 Performance, 100 Accessibility, and 100 Best Practices, while WAVE reported zero errors and zero contrast errors.

Deploying the application to Vercel helped me understand the difference between a local development environment and a production environment. The application was successfully deployed from the main branch, the Gemini API key was configured securely in Vercel, and I verified the live application by running an SEO audit against a real website.

The main lesson I learned is that building an AI product involves more than connecting an API to a user interface. Validation, error handling, testing, accessibility, security, documentation, deployment, and production verification are all important parts of shipping a usable application. This project gave me practical experience with the complete development-to-deployment workflow and increased my confidence in building AI-powered frontend applications.
