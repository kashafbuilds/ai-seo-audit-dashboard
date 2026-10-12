# AI SEO Audit Dashboard

An AI-powered SEO auditing dashboard that analyzes a website's basic SEO metadata and generates AI-assisted recommendations to help identify common on-page SEO issues.

**Live Demo:** https://ai-seo-audit-dashboard.vercel.app/
**GitHub Repository:** https://github.com/kashafbuilds/ai-seo-audit-dashboard

## Project Overview

AI SEO Audit Dashboard allows users to enter a website URL and receive an automated analysis of its basic SEO metadata.

The application extracts important page elements, calculates SEO scores, and uses Google Gemini to generate a summary and actionable recommendations.

### Features

* Analyze a website URL.
* Extract the page title, meta description, and H1 heading.
* Display an overall SEO score.
* Display technical SEO, on-page SEO, and performance scores.
* Generate AI-powered summaries and recommendations.
* Validate user input and handle API errors.
* Apply request limits to help reduce API abuse.
* Store rate-limit information using Upstash Redis.
* View the application health endpoint.
* Access dashboard pages for audit history, reports, and settings.

**Note:** Scores are estimates produced by the application's current analysis logic. The dashboard is not a replacement for a complete technical SEO crawler or a real-world performance testing service.

## Tech Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Vercel AI SDK
* Google Gemini
* Upstash Redis
* Upstash Rate Limit
* Vitest
* React Testing Library
* Vercel

## How It Works

1. The user enters a website URL.
2. The API validates the request and applies input limits.
3. The server fetches the target page's HTML.
4. The application extracts available SEO metadata, including the title, meta description, and H1 heading.
5. The extracted information is analyzed using Google Gemini through the Vercel AI SDK.
6. The dashboard displays the available SEO scores, AI summary, and recommendations.

## Architecture Overview

The project follows a Next.js application structure.

* **Frontend (`src/app`)**: Provides the dashboard interface and displays audit results.
* **Audit API (`src/app/api/audit/route.ts`)**: Validates requests, fetches website HTML, extracts metadata, and requests AI-generated feedback.
* **Health endpoint (`src/app/health`)**: Provides a health-check page or route, depending on the current implementation.
* **Dashboard pages**: Include the home dashboard and history, reports, and settings pages.
* **Google Gemini**: Generates summaries and SEO recommendations from extracted metadata.
* **Upstash Redis**: Supports shared rate-limit tracking between requests.
* **Vercel**: Hosts the production application.

## Getting Started

### Prerequisites

* Node.js and npm
* A Google Gemini API key
* An Upstash Redis database with REST credentials

### 1. Clone the repository

```bash
git clone https://github.com/kashafbuilds/ai-seo-audit-dashboard.git
cd ai-seo-audit-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root directory.

Add the following variables:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
```

Replace the example values with your own credentials. Never commit real API keys, tokens, or other secrets to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 5. Create a production build

```bash
npm run build
npm run start
```

The production server runs locally at http://localhost:3000.

## Environment Variables

| Variable                       | Purpose                                 | Required |
| ------------------------------ | --------------------------------------- | -------- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Authenticates requests to Google Gemini | Yes      |
| `UPSTASH_REDIS_REST_URL`       | Connects to the Upstash Redis REST API  | Yes      |
| `UPSTASH_REDIS_REST_TOKEN`     | Authenticates access to Upstash Redis   | Yes      |

Configure the same variables in the hosting provider's environment settings for production deployments. Redeploy after changing production environment variables.

## API and Security

The audit API includes request validation and limits intended to reduce accidental or abusive usage.

Current protections include request body size limits, URL length validation, URL protocol checks, request timeouts, HTML response size limits, and rate limiting through Upstash Redis.

The rate-limit configuration is intended to limit requests per client IP. Its effectiveness depends on correct production environment configuration and trustworthy proxy headers.

These protections reduce common forms of misuse but should not be considered a complete security guarantee. A production-grade URL-fetching service should also enforce robust DNS and IP-address validation to prevent server-side request forgery (SSRF), including redirects and private or reserved IP ranges.

The application should never expose API credentials to the browser.

## Testing

The project uses Vitest and React Testing Library for automated testing.

Run the test command configured in `package.json`. For example, if the project defines a `test` script:

```bash
npm run test
```

Before submitting changes, verify that the production build succeeds:

```bash
npm run build
```

## Production Deployment

The application is deployed on Vercel.

**Production URL:** https://ai-seo-audit-dashboard.vercel.app/

For deployment:

1. Import the repository into Vercel.
2. Configure the required environment variables.
3. Deploy the application.
4. Open the production URL and run an audit against a publicly accessible website.
5. Confirm that the audit API and rate limiting work in the deployed environment.

## Browser and Responsive Testing

The production application should be tested in:

* Google Chrome
* Mozilla Firefox
* Safari
* Mobile Safari on iOS
* A mobile-sized viewport

Verify the audit form, loading state, results display, error handling, and responsive layout in each supported browser. Record any browsers or devices that have actually been tested before claiming full compatibility.

## Screenshots

Add screenshots of the running application to this section before final submission.

Suggested screenshots:

1. Main dashboard and URL input.
2. Completed audit results.
3. AI summary and recommendations.
4. Mobile or narrow-screen layout.

Store screenshots in a folder such as `docs/screenshots/` and link them here once the image files have been added to the repository.

## Design and Implementation Decisions

* **Next.js:** Provides the application framework and server-side API route.
* **TypeScript:** Helps catch type errors and makes data handling clearer.
* **Vercel AI SDK:** Provides the integration with Google Gemini.
* **Gemini:** Generates readable summaries and actionable recommendations from extracted metadata.
* **Upstash Redis:** Provides shared storage for rate-limit tracking in production.
* **Input and response limits:** Help control request size, HTML processing, and generated output.
* **Vercel:** Provides production hosting and deployment integration.

## How AI Tools Were Used

AI tools were used as development assistants during implementation and debugging. They helped with exploring implementation approaches, drafting and reviewing code, understanding errors, and improving documentation.

The application itself uses Google Gemini through the Vercel AI SDK to generate SEO summaries and recommendations from website metadata extracted by the server.

AI-generated code and suggestions were reviewed and tested during development. The project was also built and tested locally, and the deployed application was checked using a sample URL.

AI tools were used to assist development; they do not replace testing, security review, or independent verification of SEO results.

## Limitations

* The audit focuses on a limited set of SEO metadata.
* Scores are estimates and should not be interpreted as official search-engine rankings.
* Website fetching may fail when a site blocks automated requests or returns unsupported responses.
* AI output may vary between requests and can occasionally be unavailable.
* A complete SEO audit would require additional checks such as canonical tags, robots directives, sitemap availability, structured data validation, and real performance measurements.

## Future Improvements

* Expand technical SEO checks.
* Add canonical and robots metadata analysis.
* Improve URL-fetching security and SSRF prevention.
* Add more detailed audit reports and export options.
* Expand automated tests and browser coverage.
* Improve accessibility and mobile usability.

## License

No license has been specified yet. Unless a license is added to this repository, reuse and redistribution are not explicitly granted.
