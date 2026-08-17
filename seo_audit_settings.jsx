import React, { useState, useMemo, useRef } from "react";
import {
  Globe,
  Bot,
  Bell,
  KeyRound,
  FileOutput,
  Plus,
  X,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
} from "lucide-react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
`;

const COLORS = {
  paper: "#F3F2ED",
  card: "#FFFFFF",
  ink: "#1B1D19",
  inkMuted: "#6B6E64",
  hairline: "#DDDACC",
  hairlineStrong: "#C7C3B2",
  cobalt: "#2B3A9E",
  cobaltDeep: "#202D7D",
  good: "#1E7A4C",
  goodBg: "#E4F1E8",
  warn: "#B8791A",
  warnBg: "#FBEDD9",
  bad: "#B23A2E",
  badBg: "#F7E3DF",
};

const SECTIONS = [
  { id: "crawl", label: "Site & crawl", icon: Globe },
  { id: "engine", label: "Analysis engine", icon: Bot },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "access", label: "Access & API", icon: KeyRound },
  { id: "reports", label: "Report output", icon: FileOutput },
];

const AI_MODELS = [
  "Claude Opus 4.8",
  "Claude Sonnet 5",
  "Claude Haiku 4.5",
];

function TagInput({ values, onAdd, onRemove, placeholder, mono }) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const v = draft.trim();
    if (v) onAdd(v);
    setDraft("");
  };
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginBottom: values.length ? "8px" : 0,
        }}
      >
        {values.map((v, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: COLORS.paper,
              border: `1px solid ${COLORS.hairlineStrong}`,
              borderRadius: "3px",
              padding: "4px 6px 4px 10px",
              fontSize: "12.5px",
              fontFamily: mono ? "'IBM Plex Mono', monospace" : "'IBM Plex Sans', sans-serif",
              color: COLORS.ink,
            }}
          >
            {v}
            <button
              onClick={() => onRemove(i)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                color: COLORS.inkMuted,
              }}
              aria-label={`Remove ${v}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          placeholder={placeholder}
          className="settings-input"
          style={{ fontFamily: mono ? "'IBM Plex Mono', monospace" : undefined }}
        />
        <button onClick={commit} className="btn-add" type="button">
          <Plus size={14} />
          Add
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, children, required }) {
  return (
    <label style={{ display: "block", marginBottom: "18px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: "6px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: COLORS.ink,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          {label}
          {required && (
            <span style={{ color: COLORS.bad, marginLeft: "4px" }}>*</span>
          )}
        </span>
      </div>
      {children}
      {hint && (
        <p
          style={{
            fontSize: "12px",
            color: COLORS.inkMuted,
            marginTop: "6px",
            lineHeight: 1.5,
          }}
        >
          {hint}
        </p>
      )}
    </label>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
        padding: "12px 0",
        borderTop: `1px solid ${COLORS.hairline}`,
      }}
    >
      <div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: COLORS.ink,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          {label}
        </div>
        {hint && (
          <div style={{ fontSize: "12px", color: COLORS.inkMuted, marginTop: "3px" }}>
            {hint}
          </div>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          flexShrink: 0,
          width: "38px",
          height: "22px",
          borderRadius: "11px",
          border: "none",
          cursor: "pointer",
          background: checked ? COLORS.cobalt : COLORS.hairlineStrong,
          position: "relative",
          transition: "background 0.15s ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "18px" : "2px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.15s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
          }}
        />
      </button>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, status, id }) {
  const map = {
    good: { c: COLORS.good, bg: COLORS.goodBg, t: "Configured" },
    warn: { c: COLORS.warn, bg: COLORS.warnBg, t: "Needs attention" },
    bad: { c: COLORS.bad, bg: COLORS.badBg, t: "Incomplete" },
  };
  const s = map[status];
  return (
    <div
      id={id}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
        scrollMarginTop: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "6px",
            background: COLORS.cobaltDeep,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={15} color="#fff" strokeWidth={2} />
        </div>
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "17px",
            fontWeight: 600,
            color: COLORS.ink,
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: s.c,
          background: s.bg,
          padding: "4px 9px",
          borderRadius: "3px",
          textTransform: "uppercase",
        }}
      >
        {s.t}
      </span>
    </div>
  );
}

function Gauge({ pct }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = pct >= 80 ? COLORS.good : pct >= 45 ? COLORS.warn : COLORS.bad;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke={COLORS.hairline} strokeWidth="5" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 28 28)"
          style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease" }}
        />
        <text
          x="28"
          y="32"
          textAnchor="middle"
          fontFamily="'IBM Plex Mono', monospace"
          fontSize="13"
          fontWeight="500"
          fill={COLORS.ink}
        >
          {pct}
        </text>
      </svg>
      <div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "12.5px",
            fontWeight: 600,
            color: COLORS.ink,
          }}
        >
          Audit readiness
        </div>
        <div style={{ fontSize: "11.5px", color: COLORS.inkMuted }}>
          {pct >= 80 ? "Ready to run" : pct >= 45 ? "Fill remaining fields" : "Set up required fields"}
        </div>
      </div>
    </div>
  );
}

export default function SEOAuditSettings() {
  const [url, setUrl] = useState("");
  const [crawlFreq, setCrawlFreq] = useState("weekly");
  const [crawlDepth, setCrawlDepth] = useState(3);
  const [subdomains, setSubdomains] = useState(false);
  const [respectRobots, setRespectRobots] = useState(true);

  const [aiModel, setAiModel] = useState("");
  const [threshold, setThreshold] = useState(70);
  const [competitors, setCompetitors] = useState([]);
  const [keywords, setKeywords] = useState([]);

  const [alertEmail, setAlertEmail] = useState("");
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [scoreDrop, setScoreDrop] = useState(10);

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [webhook, setWebhook] = useState("");

  const [format, setFormat] = useState("dashboard");
  const [screenshots, setScreenshots] = useState(true);
  const [whiteLabel, setWhiteLabel] = useState(false);

  const [saved, setSaved] = useState(false);
  const savedTimer = useRef(null);

  const status = useMemo(() => {
    const crawl = url ? "good" : "bad";
    const engine = aiModel ? (keywords.length ? "good" : "warn") : "bad";
    const alerts = alertEmail ? "good" : "warn";
    const access = apiKey ? "good" : "bad";
    const reports = "good";
    return { crawl, engine, alerts, access, reports };
  }, [url, aiModel, keywords, alertEmail, apiKey]);

  const pct = useMemo(() => {
    const weights = { good: 1, warn: 0.5, bad: 0 };
    const vals = Object.values(status);
    const sum = vals.reduce((acc, s) => acc + weights[s], 0);
    return Math.round((sum / vals.length) * 100);
  }, [status]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSave = () => {
    setSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
        background: COLORS.paper,
        color: COLORS.ink,
        minHeight: "100%",
        padding: "0",
      }}
    >
      <style>{FONTS}</style>
      <style>{`
        .settings-input {
          width: 100%;
          box-sizing: border-box;
          background: ${COLORS.card};
          border: 1px solid ${COLORS.hairlineStrong};
          border-radius: 4px;
          padding: 9px 11px;
          font-size: 13.5px;
          color: ${COLORS.ink};
          font-family: 'IBM Plex Sans', sans-serif;
          outline: none;
        }
        .settings-input:focus {
          border-color: ${COLORS.cobalt};
          box-shadow: 0 0 0 3px rgba(43,58,158,0.12);
        }
        .settings-select {
          width: 100%;
          box-sizing: border-box;
          background: ${COLORS.card};
          border: 1px solid ${COLORS.hairlineStrong};
          border-radius: 4px;
          padding: 9px 11px;
          font-size: 13.5px;
          color: ${COLORS.ink};
          font-family: 'IBM Plex Sans', sans-serif;
          outline: none;
          cursor: pointer;
        }
        .settings-select:focus { border-color: ${COLORS.cobalt}; }
        .btn-add {
          display: flex;
          align-items: center;
          gap: 5px;
          background: ${COLORS.ink};
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 0 14px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          padding: 9px 10px;
          border-radius: 5px;
          font-size: 13px;
          font-weight: 500;
          color: ${COLORS.inkMuted};
          font-family: 'IBM Plex Sans', sans-serif;
        }
        .nav-item:hover { background: rgba(0,0,0,0.035); color: ${COLORS.ink}; }
        input[type=range] { accent-color: ${COLORS.cobalt}; }
        ::placeholder { color: #A8A597; }
      `}</style>

      {/* Header */}
      <div
        style={{
          borderBottom: `1px solid ${COLORS.hairline}`,
          background: COLORS.card,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: "980px",
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "19px",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              Audit settings
            </div>
            <div style={{ fontSize: "12.5px", color: COLORS.inkMuted, marginTop: "2px" }}>
              Configure how this site is crawled, analyzed, and reported on
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <Gauge pct={pct} />
            <button
              onClick={handleSave}
              style={{
                background: saved ? COLORS.good : COLORS.cobalt,
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                padding: "10px 18px",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                fontFamily: "'IBM Plex Sans', sans-serif",
                transition: "background 0.15s ease",
              }}
            >
              {saved ? <Check size={15} /> : null}
              {saved ? "Saved" : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "980px",
          margin: "0 auto",
          padding: "28px 24px 80px",
          display: "grid",
          gridTemplateColumns: "180px 1fr",
          gap: "36px",
        }}
      >
        {/* Nav */}
        <nav style={{ position: "sticky", top: "96px", alignSelf: "start" }}>
          {SECTIONS.map((s) => (
            <button key={s.id} className="nav-item" onClick={() => scrollTo(s.id)}>
              <s.icon size={15} />
              {s.label}
              <ChevronRight size={12} style={{ marginLeft: "auto", opacity: 0.5 }} />
            </button>
          ))}
        </nav>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Site & crawl */}
          <section
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.hairline}`,
              borderRadius: "8px",
              padding: "24px",
            }}
          >
            <SectionHeader icon={Globe} title="Site & crawl" status={status.crawl} id="crawl" />
            <Field label="Website URL" required hint="The root domain this audit will crawl.">
              <input
                className="settings-input"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                placeholder="https://www.example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <Field label="Crawl frequency">
                <select
                  className="settings-select"
                  value={crawlFreq}
                  onChange={(e) => setCrawlFreq(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </Field>
              <Field label={`Crawl depth — ${crawlDepth} levels`}>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={crawlDepth}
                  onChange={(e) => setCrawlDepth(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </Field>
            </div>
            <Toggle
              checked={subdomains}
              onChange={setSubdomains}
              label="Include subdomains"
              hint="Crawl blog., shop., and other subdomains as part of this audit."
            />
            <Toggle
              checked={respectRobots}
              onChange={setRespectRobots}
              label="Respect robots.txt"
              hint="Skip pages disallowed for crawlers. Turn off only for staging environments."
            />
          </section>

          {/* Analysis engine */}
          <section
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.hairline}`,
              borderRadius: "8px",
              padding: "24px",
            }}
          >
            <SectionHeader icon={Bot} title="Analysis engine" status={status.engine} id="engine" />
            <Field label="AI model for content analysis" required hint="Used to score readability, intent match, and on-page content quality.">
              <select
                className="settings-select"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
              >
                <option value="">Select a model</option>
                {AI_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`Content quality threshold — ${threshold}`} hint="Pages scoring below this are flagged for review.">
              <input
                type="range"
                min="0"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </Field>
            <Field label="Focus keywords" hint="Terms the audit should track ranking and relevance for.">
              <TagInput
                values={keywords}
                onAdd={(v) => setKeywords((k) => [...k, v])}
                onRemove={(i) => setKeywords((k) => k.filter((_, idx) => idx !== i))}
                placeholder="e.g. project management software"
              />
            </Field>
            <Field label="Competitor URLs" hint="Compared against on every audit run.">
              <TagInput
                values={competitors}
                onAdd={(v) => setCompetitors((k) => [...k, v])}
                onRemove={(i) => setCompetitors((k) => k.filter((_, idx) => idx !== i))}
                placeholder="https://competitor.com"
                mono
              />
            </Field>
          </section>

          {/* Alerts */}
          <section
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.hairline}`,
              borderRadius: "8px",
              padding: "24px",
            }}
          >
            <SectionHeader icon={Bell} title="Alerts" status={status.alerts} id="alerts" />
            <Field label="Alert email" hint="Where audit notifications are sent.">
              <input
                className="settings-input"
                placeholder="you@company.com"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
              />
            </Field>
            <Field label={`Score drop threshold — ${scoreDrop} pts`} hint="Trigger a critical alert when the overall score falls by this much between runs.">
              <input
                type="range"
                min="1"
                max="40"
                value={scoreDrop}
                onChange={(e) => setScoreDrop(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </Field>
            <Toggle
              checked={criticalAlerts}
              onChange={setCriticalAlerts}
              label="Notify on critical issues"
              hint="Broken pages, indexing errors, and security warnings."
            />
            <Toggle
              checked={weeklySummary}
              onChange={setWeeklySummary}
              label="Weekly summary email"
              hint="A digest of score trends and new issues, every Monday."
            />
          </section>

          {/* Access & API */}
          <section
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.hairline}`,
              borderRadius: "8px",
              padding: "24px",
            }}
          >
            <SectionHeader icon={KeyRound} title="Access & API" status={status.access} id="access" />
            <Field label="API key" required hint="Used by external tools to pull audit results.">
              <div style={{ position: "relative" }}>
                <input
                  className="settings-input"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", paddingRight: "38px" }}
                  type={showKey ? "text" : "password"}
                  placeholder="sk-audit-••••••••••••"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: COLORS.inkMuted,
                    display: "flex",
                  }}
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field label="Webhook URL" hint="Receives a POST request when a new audit completes.">
              <input
                className="settings-input"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                placeholder="https://your-app.com/webhooks/seo-audit"
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
              />
            </Field>
          </section>

          {/* Report output */}
          <section
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.hairline}`,
              borderRadius: "8px",
              padding: "24px",
            }}
          >
            <SectionHeader icon={FileOutput} title="Report output" status={status.reports} id="reports" />
            <Field label="Default report format">
              <select
                className="settings-select"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="dashboard">Dashboard only</option>
                <option value="pdf">PDF export</option>
                <option value="csv">CSV export</option>
              </select>
            </Field>
            <Toggle
              checked={screenshots}
              onChange={setScreenshots}
              label="Include page screenshots"
              hint="Adds a visual snapshot for each flagged page in the report."
            />
            <Toggle
              checked={whiteLabel}
              onChange={setWhiteLabel}
              label="White-label branding"
              hint="Replace the dashboard logo with your own on shared reports."
            />
          </section>
        </div>
      </div>
    </div>
  );
}
