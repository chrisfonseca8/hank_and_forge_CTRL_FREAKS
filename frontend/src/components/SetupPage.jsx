// src/components/SetupPage.jsx
// Enterprise recruitment onboarding — collects candidate name + role.

import { useState } from "react";

const ROLES = [
  {
    id:          "Backend Engineer",
    icon:        "⚙",
    label:       "Backend Engineer",
    description: "APIs, databases, distributed systems, cloud infrastructure",
  },
  {
    id:          "Machine Learning Engineer",
    icon:        "◎",
    label:       "ML Engineer",
    description: "Model training, deployment, MLOps, data pipelines",
  },
];

export default function SetupPage({ onStart, loading }) {
  const [name,         setName]         = useState("");
  const [selectedRole, setSelectedRole] = useState(null);

  const nameValid = name.trim().length >= 2;
  const canBegin  = nameValid && selectedRole && !loading;

  const handleStart = () => {
    if (canBegin) onStart({ role: selectedRole, name: name.trim() });
  };

  return (
    <main className="page page-setup">
      <div className="setup-shell">

        {/* ── Left: branding panel ──────────────────────── */}
        <div className="setup-brand">
          <div className="brand-badge">Enterprise Assessment Platform</div>
          <h1 className="brand-heading">
            Intelligent<br />Interview<br />Simulation
          </h1>
          <p className="brand-sub">
            Adaptive role-specific evaluation that adjusts in real time
            to your expertise level — from introductory to expert-tier questions.
          </p>
          <ul className="brand-features">
            <li>◈ Adaptive difficulty progression</li>
            <li>◈ AI-powered answer evaluation</li>
            <li>◈ Quantified suitability report</li>
          </ul>
        </div>

        {/* ── Right: form panel ─────────────────────────── */}
        <div className="setup-form-card">
          <p className="form-heading">Begin Your Assessment</p>
          <p className="form-sub">
            Complete your profile to start the simulation.
          </p>

          {/* Candidate name */}
          <label className="field-label" htmlFor="candidate-name">
            Candidate Name
          </label>
          <input
            id="candidate-name"
            className="setup-input"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            autoComplete="off"
          />

          {/* Role selection */}
          <label className="field-label" style={{ marginTop: "24px" }}>
            Position Applying For
          </label>
          <div className="role-grid">
            {ROLES.map((r) => (
              <button
                key={r.id}
                className={`role-btn ${selectedRole === r.id ? "selected" : ""}`}
                onClick={() => setSelectedRole(r.id)}
              >
                <span className="role-icon">{r.icon}</span>
                <span className="role-label">{r.label}</span>
                <span className="role-desc">{r.description}</span>
              </button>
            ))}
          </div>

          <button
            className="btn-primary"
            onClick={handleStart}
            disabled={!canBegin}
          >
            {loading ? (
              <><span className="spinner" /> Initialising…</>
            ) : (
              "Begin Assessment →"
            )}
          </button>
        </div>

      </div>
    </main>
  );
}