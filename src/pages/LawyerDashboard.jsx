import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getCases, getHearings } from "../api";

// Status badge colours
const STATUS_STYLE = {
  Open:     { bg: "#dcfce7", color: "#166534" },
  Closed:   { bg: "#f1f5f9", color: "#475569" },
  Resolved: { bg: "#d1fae5", color: "#065f46" },
  default:  { bg: "#e0f2fe", color: "#0369a1" },
};

function LawyerDashboard() {
  const [cases, setCases]       = useState([]);
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [allCases, allHearings] = await Promise.all([getCases(), getHearings()]);
        setCases(allCases);
        setHearings(allHearings);
      } catch (err) {
        console.error("Error loading lawyer data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const openCases     = cases.filter(c => c.status === "Open").length;
  const closedCases   = cases.filter(c => ["Closed","Resolved"].includes(c.status)).length;
  const upcomingH     = hearings.filter(h => h.outcome === "Scheduled" || h.outcome === "Pending").length;

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <h1 className="page-title">Lawyer Dashboard</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
          Welcome to your workspace. Here are all cases assigned to you.
        </p>

        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Cases</h3>
            <p className="stat-number">{cases.length}</p>
          </div>
          <div className="stat-card">
            <h3>Active / Open</h3>
            <p className="stat-number" style={{ color: "#166534" }}>{openCases}</p>
          </div>
          <div className="stat-card">
            <h3>Closed / Resolved</h3>
            <p className="stat-number" style={{ color: "#475569" }}>{closedCases}</p>
          </div>
          <div className="stat-card">
            <h3>Upcoming Hearings</h3>
            <p className="stat-number" style={{ color: "#1d4ed8" }}>{upcomingH}</p>
          </div>
        </div>

        <section className="section-card" style={{ marginTop: "30px" }}>
          <h2 style={{ marginTop: 0 }}>All Cases</h2>
          {loading ? (
            <p>Loading cases…</p>
          ) : cases.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No cases assigned.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Client</th>
                    <th>Filed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => {
                    const style = STATUS_STYLE[c.status] || STATUS_STYLE.default;
                    return (
                      <tr key={c.case_id}>
                        <td>#{c.case_id}</td>
                        <td style={{ fontWeight: 600 }}>{c.title}</td>
                        <td>{c.type}</td>
                        <td>{c.client?.client_name || "—"}</td>
                        <td>{new Date(c.filing_date).toLocaleDateString()}</td>
                        <td>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            background: style.bg,
                            color: style.color,
                          }}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Upcoming hearings quick view */}
        {hearings.filter(h => h.outcome !== "Closed" && h.outcome !== "Resolved").length > 0 && (
          <section className="section-card" style={{ marginTop: "20px" }}>
            <h2 style={{ marginTop: 0 }}>Active Hearings</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Hearing</th>
                    <th>Case</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hearings
                    .filter(h => h.outcome !== "Closed" && h.outcome !== "Resolved")
                    .map(h => (
                      <tr key={h.hearing_id}>
                        <td>#{h.hearing_id}</td>
                        <td>{h.case?.title || "—"}</td>
                        <td>{new Date(h.hearing_date).toLocaleDateString()}</td>
                        <td>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "0.82rem",
                            background: "#fef3c7",
                            color: "#d97706",
                          }}>
                            {h.outcome}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default LawyerDashboard;
