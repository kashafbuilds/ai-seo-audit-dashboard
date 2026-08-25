async function getHealthData() {
  try {
    const response = await fetch("http://localhost:3001/api/audit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://example.com",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Backend request failed");
    }

    const result = await response.json();

    return {
      status: "healthy",
      backendConnected: true,
      auditedUrl: result.data?.url || "Not available",
      message: "Successfully fetched data from the Express backend",
    };
  } catch {
    return {
      status: "offline",
      backendConnected: false,
      auditedUrl: "Not available",
      message:
        "Could not connect to the Express backend. Make sure the backend is running on port 3001.",
    };
  }
}

export default async function HealthPage() {
  const health = await getHealthData();

  return (
    <main>
      <h1>Health Check</h1>
      <p>This page verifies that the application can fetch data successfully.</p>

      <section
        style={{
          marginTop: "24px",
          padding: "24px",
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
        }}
      >
        <h2>Status: {health.status}</h2>
        <p>
          <strong>Backend Connected:</strong>{" "}
          {health.backendConnected ? "Yes ✓" : "No"}
        </p>
        <p>
          <strong>Audited URL:</strong> {health.auditedUrl}
        </p>
        <p>{health.message}</p>
      </section>
    </main>
  );
}