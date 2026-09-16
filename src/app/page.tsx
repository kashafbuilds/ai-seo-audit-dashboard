"use client";

import { useState } from "react";
import ScoreCard from "@/components/ScoreCard";

type AuditResult = {
  overallScore: number;
  technicalScore: number;
  onPageScore: number;
  performanceScore: number;
  titleStatus: string;
  descriptionStatus: string;
  h1Status: string;
  summary: string;
  recommendations: string[];
};

type AuditResponse = {
  url: string;
  metadata: {
    title: string;
    description: string;
    h1: string;
  };
  audit: AuditResult;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState("");

  async function runAudit() {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Please enter a website URL.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "SEO audit failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            AI SEO Audit
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Analyze Your Website
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Enter a website URL and let AI analyze its SEO metadata and provide
            actionable recommendations.
          </p>
        </header>

        <section
          aria-labelledby="audit-form-title"
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2 id="audit-form-title" className="sr-only">
            Website SEO audit form
          </h2>

          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <label
                htmlFor="website-url"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Website URL
              </label>

              <input
                id="website-url"
                name="website-url"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    runAudit();
                  }
                }}
                placeholder="https://example.com"
                autoComplete="url"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "audit-error" : undefined}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div className="md:self-end">
              <button
                type="button"
                onClick={runAudit}
                disabled={loading}
                aria-busy={loading}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                {loading ? "Analyzing..." : "Run SEO Audit"}
              </button>
            </div>
          </div>

          {error && (
            <div
              id="audit-error"
              role="alert"
              aria-live="assertive"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p className="font-semibold">Audit failed</p>
              <p className="mt-1">{error}</p>
            </div>
          )}
        </section>

        {loading && (
          <div
            className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm"
            role="status"
            aria-live="polite"
          >
            <div
              className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
              aria-hidden="true"
            />

            <p className="mt-4 font-medium text-slate-700">
              AI is analyzing the website...
            </p>

            <p className="mt-2 text-sm text-slate-500">
              This may take a few seconds.
            </p>
          </div>
        )}

        {result && !loading && (
          <section
            className="mt-8 space-y-6"
            aria-label="SEO audit results"
          >
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Analyzed URL</p>

              <p className="mt-1 break-all font-semibold text-slate-900">
                {result.url}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ScoreCard
                title="Overall Score"
                score={result.audit.overallScore}
              />

              <ScoreCard
                title="Technical SEO"
                score={result.audit.technicalScore}
              />

              <ScoreCard
                title="On-Page SEO"
                score={result.audit.onPageScore}
              />

              <ScoreCard
                title="Performance"
                score={result.audit.performanceScore}
              />
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                SEO Metadata
              </h2>

              <div className="mt-5 space-y-5">
                <MetadataItem
                  label="Title"
                  value={result.metadata.title}
                  status={result.audit.titleStatus}
                />

                <MetadataItem
                  label="Meta Description"
                  value={result.metadata.description}
                  status={result.audit.descriptionStatus}
                />

                <MetadataItem
                  label="H1"
                  value={result.metadata.h1}
                  status={result.audit.h1Status}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                AI Summary
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                {result.audit.summary}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Recommendations
              </h2>

              {result.audit.recommendations.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {result.audit.recommendations.map(
                    (recommendation, index) => (
                      <li
                        key={`${recommendation}-${index}`}
                        className="rounded-xl bg-slate-50 p-4 text-slate-700"
                      >
                        <span className="mr-2 font-semibold text-blue-600">
                          {index + 1}.
                        </span>

                        {recommendation}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  No recommendations were generated for this audit.
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function MetadataItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: string;
}) {
  const isPass = status === "Pass";

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-slate-900">{label}</h3>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isPass
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {status}
        </span>
      </div>

      <p className="mt-2 break-words rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        {value}
      </p>
    </div>
  );
}