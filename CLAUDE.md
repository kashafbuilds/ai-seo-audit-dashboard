# CLAUDE.md — AI SEO Audit Dashboard

Instructions for AI assistants working in this repository.

## Project Purpose

This project is a responsive **AI SEO Audit Dashboard** that lets users enter a website URL and receive a structured SEO analysis. The frontend presents scores, category breakdowns, technical/on-page/mobile checks, performance metrics, issues, recommendations, and a downloadable HTML report. The backend fetches and parses real page content to produce audit results.

## Technology Stack

| Layer | Technology | Role |
|-------|------------|------|
| Markup | HTML | Dashboard structure and semantic layout |
| Styling | CSS | Responsive design, layout, and visual styling |
| Frontend logic | Vanilla JavaScript (ES6+) | Form handling, API calls, results rendering, report download |
| Runtime | Node.js | Server runtime |
| Backend | Express | HTTP server, static file hosting, REST API |
| HTML parsing | Cheerio | Parse fetched HTML for SEO signals |
| HTTP client | Axios | Fetch target websites, robots.txt, and sitemap.xml |

Do not introduce frontend frameworks (React, Vue, etc.) unless explicitly requested.

## How to Run Locally

**Prerequisites:** Node.js 18+ (LTS recommended), npm, Git

```bash
git clone https://github.com/kashafbuilds/ai-seo-audit-dashboard.git
cd ai-seo-audit-dashboard
npm install
npm start
```

Open **http://localhost:3001** in a browser.

> Do not open `index.html` directly from the file system. The dashboard requires the Express server for `/api/audit`.

**Health check:** `GET http://localhost:3001/api/health`

## Project Structure

```
AI SEO Audit Dashboard/
├── index.html       # Dashboard markup
├── styles.css       # All styles and responsive rules
├── script.js        # Frontend logic and API integration
├── server.js        # Express server, SEO analysis, API routes
├── package.json     # Dependencies and npm scripts
├── README.md        # User-facing documentation
├── CLAUDE.md        # AI assistant instructions (this file)
├── LICENSE          # MIT license
└── .gitignore       # Git ignore rules
```

### Coding Conventions

- **JavaScript:** Use ES6+ syntax. Prefer clear function names and section comments (`// =====`) to match existing files.
- **Frontend:** Keep DOM queries and event listeners at the top of `script.js`. Separate fetch logic, display logic, and utility helpers.
- **Backend:** Keep route handlers thin; put analysis logic in dedicated functions inside `server.js`.
- **Styling:** Use existing CSS variables and class naming patterns. Avoid inline styles in HTML unless already present.
- **Dependencies:** Do not add new npm packages without explicit approval.
- **Comments:** Add comments only for non-obvious business logic; avoid restating what the code already shows.
- **Commits:** Use Conventional Commits when committing (`feat:`, `fix:`, `docs:`, `chore:`).

## API Contract — Do Not Break

Preserve the existing API shape. The frontend depends on these endpoints and response formats.

### `POST /api/audit`

**Request:**
```json
{ "url": "https://example.com" }
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "url": "...",
    "timestamp": "...",
    "overallScore": 0,
    "technicalScore": 0,
    "onPageScore": 0,
    "performanceScore": 0,
    "technicalResults": {},
    "metadata": {},
    "issues": {
      "total": 0,
      "critical": 0,
      "warning": 0,
      "info": 0,
      "items": []
    }
  }
}
```

**Error response (400):**
```json
{ "success": false, "error": "..." }
```

### `GET /api/health`

**Response (200):**
```json
{ "status": "ok", "message": "...", "timestamp": "..." }
```

When extending the API, add new fields without removing or renaming existing ones that `script.js` reads.

## Rules for AI Assistants

### 1. Do not change scoring or UI layout unless explicitly requested

- Do not alter score calculation logic, score ranges, or weighting in `server.js`.
- Do not rearrange, remove, or restyle dashboard sections in `index.html` or `styles.css`.
- Do not change the visual layout of results cards, progress bars, or the circular score display.
- Bug fixes and copy tweaks are fine; structural or visual redesigns require explicit user approval.

### 2. Validate changes before considering a task complete

Before marking any task done:

1. Confirm the server starts without errors (`npm start`).
2. Open the dashboard at `http://localhost:3001` and run an audit against a real URL.
3. Verify scores, category results, issues, and recommendations render correctly.
4. Confirm `GET /api/health` returns `{ "status": "ok" }`.
5. If frontend code changed, check the browser console for errors.
6. If backend code changed, confirm the `/api/audit` response still matches the contract above.

### 3. Keep changes minimal and focused

- Solve only what the user asked for. Do not refactor unrelated code.
- Prefer the smallest correct diff over large rewrites.
- Reuse existing functions and patterns instead of introducing new abstractions.
- Do not modify files the user did not ask to change.
- Do not add tests, configs, or dependencies unless requested.

## Working Style

When unsure about a change that affects scoring, layout, or the API contract, ask the user before proceeding. Match the tone and structure of existing code — this project favors straightforward, readable vanilla JS over clever abstractions.

## Lessons Learned from AI-Assisted Workflow

### 4. Match the existing frontend architecture
- Inspect the repository's actual stack and existing file structure before generating frontend code.
- This project uses vanilla HTML, CSS, and JavaScript.
- Do not create JSX, React components, or framework-specific frontend files unless explicitly requested.

### 5. Verify file-level constraints before implementation
- Read the relevant project instructions and existing files before writing code.
- Reuse existing CSS variables, class naming patterns, and project conventions.
- Keep feature changes focused and avoid unrelated file changes.

### 6. Verify behavior, not just generated code
- Run and test the feature after implementation.
- For forms, verify required-field validation, invalid input handling, interactive controls, save/reset behavior, and persistence.
- Verify the implementation against the project constraints before committing.

These rules are based on the Round 1 vs Round 2 workflow: Round 1 incorrectly produced a JSX file even though this repository uses vanilla HTML/CSS/JavaScript, while Round 2 corrected this by using settings.html, settings.css, and settings.js.
