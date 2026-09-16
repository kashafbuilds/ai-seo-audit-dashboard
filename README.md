# AI SEO Audit Dashboard

An AI-powered SEO audit tool that analyzes a website's basic SEO metadata and provides an overall SEO score, individual scores, and AI-generated recommendations.

## Project Overview

The AI SEO Audit Dashboard allows a user to enter a website URL and receive an automated SEO analysis.

The application checks:

- Page title
- Meta description
- H1 heading
- Overall SEO score
- AI-generated recommendations

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vercel AI SDK
- Google Gemini
- Vitest
- React Testing Library

## AI Integration

The application uses Google Gemini through the Vercel AI SDK.

Gemini analyzes the extracted website metadata and returns structured SEO feedback including:

- Overall score
- Title score
- Meta description score
- H1 score
- Summary
- Recommendations

The API response is validated before being displayed to the user.

## Getting Started

### 1. Install dependencies

```bash
npm install