import React, { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const runAudit = async (event) => {
    event.preventDefault();

    if (!url.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "SEO audit failed.");
      }

      setResults(result.data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const runNewAudit = () => {
    setUrl("");
    setResults(null);
    setError("");
  };

  const getStatusIcon = (status) => {
    if (status === "pass") return "✓";
    if (status === "warning") return "⚠";
    if (status === "error") return "✕";
    return "ℹ";
  };

  const getSeverityClass = (severity) => {
    if (severity === "critical") return "issue-critical";
    if (severity === "warning") return "issue-warning";
    return "issue-info";
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>🔍 AI SEO Audit Dashboard</h1>
            <p className="tagline">
              Professional SEO Analysis & Recommendations
            </p>
          </div>

          <nav className="nav">
            <ul>
              <li>
                <a href="#" className="nav-link active">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="nav-link">
                  History
                </a>
              </li>
              <li>
                <a href="#" className="nav-link">
                  Reports
                </a>
              </li>
              <li>
                <a href="#" className="nav-link">
                  Settings
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <section className="input-section">
          <div className="input-container">
            <h2>Analyze Your Website</h2>

            <form onSubmit={runAudit} className="audit-form">
              <div className="input-group">
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="Enter your website URL (e.g., https://example.com)"
                  required
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Analyzing..." : "Run SEO Audit"}
                </button>
              </div>

              <p className="form-hint">
                We'll analyze your website's SEO performance and provide
                actionable recommendations.
              </p>
            </form>
          </div>
        </section>

        {loading && (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Analyzing your website...</p>
          </div>
        )}

        {error && !loading && (
          <div className="card">
            <p>{error}</p>
          </div>
        )}

        {results && !loading && (
          <div className="results-section">
            <section className="card score-card">
              <div className="score-container">
                <div className="score-circle">
                  <span className="score-number">
                    {results.overallScore}
                  </span>
                  <span className="score-text">Overall Score</span>
                </div>

                <div className="score-summary">
                  <h3>SEO Audit Results</h3>

                  <p>
                    Audit completed for{" "}
                    <strong>{results.url}</strong>
                  </p>

                  <div className="score-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-label">
                        Technical SEO
                      </span>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${results.technicalScore}%`,
                          }}
                        ></div>
                      </div>

                      <strong>{results.technicalScore}/100</strong>
                    </div>

                    <div className="breakdown-item">
                      <span className="breakdown-label">
                        On-Page SEO
                      </span>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${results.onPageScore}%`,
                          }}
                        ></div>
                      </div>

                      <strong>{results.onPageScore}/100</strong>
                    </div>

                    <div className="breakdown-item">
                      <span className="breakdown-label">
                        Performance
                      </span>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${results.performanceScore}%`,
                          }}
                        ></div>
                      </div>

                      <strong>{results.performanceScore}/100</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid-2">
              <section className="card">
                <div className="card-header">
                  <h3>Technical SEO</h3>
                  <span className="badge badge-info">
                    {results.technicalScore}/100
                  </span>
                </div>

                <ul className="results-list">
                  {results.technicalResults.map((item, index) => (
                    <li
                      key={index}
                      className={`result-item result-${item.status}`}
                    >
                      <span className="icon">
                        {getStatusIcon(item.status)}
                      </span>

                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="card">
                <div className="card-header">
                  <h3>On-Page SEO</h3>

                  <span className="badge badge-success">
                    {results.onPageScore}/100
                  </span>
                </div>

                <ul className="results-list">
                  <li className="result-item result-pass">
                    <span className="icon">✓</span>
                    <span>
                      Page title:{" "}
                      {results.metadata.title || "Missing"}
                    </span>
                  </li>

                  <li
                    className={`result-item ${
                      results.metadata.descriptionOptimal
                        ? "result-pass"
                        : "result-warning"
                    }`}
                  >
                    <span className="icon">
                      {results.metadata.descriptionOptimal
                        ? "✓"
                        : "⚠"}
                    </span>

                    <span>
                      Meta description:{" "}
                      {results.metadata.descriptionOptimal
                        ? "Optimized"
                        : "Needs improvement"}
                    </span>
                  </li>

                  <li className="result-item result-pass">
                    <span className="icon">✓</span>

                    <span>
                      H1 tags: {results.metadata.h1Count}
                    </span>
                  </li>

                  <li
                    className={`result-item ${
                      results.metadata.hasCanonical
                        ? "result-pass"
                        : "result-info"
                    }`}
                  >
                    <span className="icon">
                      {results.metadata.hasCanonical ? "✓" : "ℹ"}
                    </span>

                    <span>
                      Canonical tag:{" "}
                      {results.metadata.hasCanonical
                        ? "Present"
                        : "Not detected"}
                    </span>
                  </li>

                  <li
                    className={`result-item ${
                      results.metadata.hasStructuredData
                        ? "result-pass"
                        : "result-info"
                    }`}
                  >
                    <span className="icon">
                      {results.metadata.hasStructuredData
                        ? "✓"
                        : "ℹ"}
                    </span>

                    <span>
                      Structured data:{" "}
                      {results.metadata.hasStructuredData
                        ? "Detected"
                        : "Not detected"}
                    </span>
                  </li>
                </ul>
              </section>

              <section className="card">
                <div className="card-header">
                  <h3>Performance Metrics</h3>

                  <span className="badge badge-warning">
                    {results.performanceScore}/100
                  </span>
                </div>

                <div className="metrics-list">
                  <div className="metric-item">
                    <span className="metric-label">
                      Server Response Time
                    </span>

                    <span className="metric-value">
                      {results.metadata.performanceMetrics.responseTimeMs}
                      ms
                    </span>
                  </div>

                  <div className="metric-item">
                    <span className="metric-label">
                      HTML Document Size
                    </span>

                    <span className="metric-value">
                      {results.metadata.performanceMetrics.htmlDocumentSize}
                    </span>
                  </div>

                  <div className="metric-item">
                    <span className="metric-label">
                      Total Images
                    </span>

                    <span className="metric-value">
                      {results.metadata.performanceMetrics.totalImages}
                    </span>
                  </div>

                  <div className="metric-item">
                    <span className="metric-label">
                      Images Missing Alt
                    </span>

                    <span className="metric-value">
                      {results.metadata.performanceMetrics.imagesWithoutAlt}
                    </span>
                  </div>
                </div>
              </section>

              <section className="card">
                <div className="card-header">
                  <h3>Mobile Friendliness</h3>

                  <span
                    className={`badge ${
                      results.metadata.hasViewport
                        ? "badge-success"
                        : "badge-warning"
                    }`}
                  >
                    {results.metadata.hasViewport ? "✓" : "⚠"}
                  </span>
                </div>

                <ul className="results-list">
                  <li
                    className={`result-item ${
                      results.metadata.hasViewport
                        ? "result-pass"
                        : "result-warning"
                    }`}
                  >
                    <span className="icon">
                      {results.metadata.hasViewport ? "✓" : "⚠"}
                    </span>

                    <span>
                      Responsive viewport{" "}
                      {results.metadata.hasViewport
                        ? "configured"
                        : "not detected"}
                    </span>
                  </li>

                  <li className="result-item result-pass">
                    <span className="icon">✓</span>

                    <span>
                      HTTPS:{" "}
                      {results.metadata.isHttps
                        ? "Enabled"
                        : "Not enabled"}
                    </span>
                  </li>

                  <li className="result-item result-info">
                    <span className="icon">ℹ</span>

                    <span>
                      Viewport:{" "}
                      {results.metadata.viewportMeta ||
                        "Not available"}
                    </span>
                  </li>
                </ul>
              </section>
            </div>

            <section className="card issues-card">
              <div className="card-header">
                <h3>Issues & Recommendations</h3>

                <span className="badge badge-warning">
                  {results.issues.total}
                </span>
              </div>

              <div className="issues-container">
                {results.issues.items.map((issue, index) => (
                  <div
                    key={index}
                    className={`issue-item ${getSeverityClass(
                      issue.severity
                    )}`}
                  >
                    <div className="issue-header">
                      <span className="issue-severity">
                        {issue.severity}
                      </span>

                      <h4>{issue.title}</h4>
                    </div>

                    <p className="issue-description">
                      {issue.description}
                    </p>

                    <p className="issue-recommendation">
                      <strong>Recommendation:</strong>{" "}
                      {issue.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="action-buttons">
              <button
                className="btn btn-secondary"
                onClick={runNewAudit}
              >
                Run New Audit
              </button>
            </div>

            <p className="form-hint">
              Audit completed: {results.timestamp}
            </p>
          </div>
        )}

        {!results && !loading && !error && (
          <div className="empty-state">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
            >
              <circle
                cx="60"
                cy="60"
                r="55"
                stroke="#e5e7eb"
                strokeWidth="2"
              />

              <path
                d="M60 35v50M35 60h50"
                stroke="#9ca3af"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            <p>
              Enter a URL above and click "Run SEO Audit" to get started
            </p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© 2026 AI SEO Audit Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;