import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function App() {
  const [health, setHealth] = useState(null);
  const [ready, setReady] = useState(null);
  const [version, setVersion] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    severity: "medium",
    serviceName: "backend-api",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function apiFetch(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `Request failed with ${response.status}`);
    }

    return data;
  }

  async function loadSystemStatus() {
    try {
      setError("");
      const [healthData, readyData, versionData] = await Promise.all([
        apiFetch("/health"),
        apiFetch("/ready"),
        apiFetch("/version"),
      ]);

      setHealth(healthData);
      setReady(readyData);
      setVersion(versionData);
    } catch (err) {
      setError(`System status check failed: ${err.message}`);
    }
  }

  async function loadIncidents() {
    try {
      setError("");
      const data = await apiFetch("/api/incidents");
      setIncidents(data.data || []);
    } catch (err) {
      setError(`Failed to load incidents: ${err.message}`);
    }
  }

  async function createIncident(event) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");

      await apiFetch("/api/incidents", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setMessage("Incident created successfully.");
      setForm({
        title: "",
        severity: "medium",
        serviceName: "backend-api",
        description: "",
      });

      await loadIncidents();
    } catch (err) {
      setError(`Failed to create incident: ${err.message}`);
    }
  }

  async function triggerSimulatedError() {
    try {
      setError("");
      setMessage("");
      await apiFetch("/simulate/error");
    } catch (err) {
      setError(`Simulated production error triggered: ${err.message}`);
    }
  }

  useEffect(() => {
    loadSystemStatus();
    loadIncidents();
  }, []);

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">DevOps + AI + SRE</p>
        <h1>AI SRE Copilot</h1>
        <p>
          Production-style incident dashboard for practicing health checks,
          readiness checks, persistent incidents, and debugging workflows.
        </p>
        <div className="actions">
          <button onClick={loadSystemStatus}>Refresh System Status</button>
          <button className="secondary" onClick={loadIncidents}>Refresh Incidents</button>
          <button className="danger" onClick={triggerSimulatedError}>Trigger Simulated 500</button>
        </div>
      </section>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <section className="grid cards">
        <div className="card">
          <span className="label">Health</span>
          <h2>{health?.status || "unknown"}</h2>
          <p>Uptime: {health?.uptimeSeconds ?? "-"} seconds</p>
        </div>

        <div className="card">
          <span className="label">Readiness</span>
          <h2>{ready?.status || "unknown"}</h2>
          <p>Database: {ready?.dependencies?.database?.status || "unknown"}</p>
        </div>

        <div className="card">
          <span className="label">Version</span>
          <h2>{version?.version || "-"}</h2>
          <p>Node: {version?.nodeVersion || "-"}</p>
        </div>

        <div className="card">
          <span className="label">Incidents</span>
          <h2>{incidents.length}</h2>
          <p>Stored in PostgreSQL</p>
        </div>
      </section>

      <section className="grid content-grid">
        <form className="panel" onSubmit={createIncident}>
          <h2>Create Incident</h2>

          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Backend API returning 500 errors"
              required
            />
          </label>

          <label>
            Severity
            <select
              value={form.severity}
              onChange={(event) => setForm({ ...form, severity: event.target.value })}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>
          </label>

          <label>
            Service Name
            <input
              value={form.serviceName}
              onChange={(event) => setForm({ ...form, serviceName: event.target.value })}
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Describe symptoms, impact, and recent changes"
            />
          </label>

          <button type="submit">Create Incident</button>
        </form>

        <section className="panel">
          <h2>Incident List</h2>

          {incidents.length === 0 ? (
            <p>No incidents found.</p>
          ) : (
            <div className="incident-list">
              {incidents.map((incident) => (
                <article className="incident" key={incident.id}>
                  <div>
                    <h3>{incident.title}</h3>
                    <p>{incident.description}</p>
                    <small>{incident.serviceName} • {incident.createdAt}</small>
                  </div>
                  <span className={`badge ${incident.severity}`}>{incident.severity}</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <footer>
        API Base URL: <code>{API_BASE_URL}</code>
      </footer>
    </main>
  );
}

export default App;
