import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getHearings, updateHearing } from "../api";

const STATUS_COLORS = {
  Pending:   { bg: "#fef3c7", color: "#d97706" },
  Scheduled: { bg: "#dbeafe", color: "#1d4ed8" },
  Adjourned: { bg: "#fce7f3", color: "#be185d" },
  Resolved:  { bg: "#dcfce7", color: "#166534" },
  Closed:    { bg: "#f1f5f9", color: "#475569" },
};

function JudgeDashboard() {
  const [hearings, setHearings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeId, setActiveId]     = useState(null);   // expanded hearing id
  const [editForm, setEditForm]     = useState({});     // { outcome, notes, hearing_date }
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState("");

  useEffect(() => {
    async function fetchMyHearings() {
      try {
        const all = await getHearings();
        setHearings(all);
      } catch (err) {
        console.error("Error loading hearings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyHearings();
  }, []);

  // Open / close the action panel for a hearing
  const togglePanel = (h) => {
    if (activeId === h.hearing_id) {
      setActiveId(null);
    } else {
      setActiveId(h.hearing_id);
      setEditForm({
        outcome:      h.outcome,
        notes:        h.notes || "",
        hearing_date: h.hearing_date ? new Date(h.hearing_date).toISOString().split("T")[0] : "",
      });
      setSaveMsg("");
    }
  };

  const handleSave = async (hearingId) => {
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await updateHearing(hearingId, editForm);
      setHearings(prev => prev.map(h => h.hearing_id === hearingId ? { ...h, ...updated } : h));
      setSaveMsg("✓ Saved successfully");
      setTimeout(() => { setSaveMsg(""); setActiveId(null); }, 1500);
    } catch (err) {
      setSaveMsg("❌ " + (err.message || "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const pending   = hearings.filter(h => h.outcome === "Pending").length;
  const scheduled = hearings.filter(h => h.outcome === "Scheduled").length;
  const resolved  = hearings.filter(h => ["Resolved","Closed"].includes(h.outcome)).length;

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <h1 className="page-title">Judge Dashboard</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
          Manage your docket — update hearing status, add notes, or reschedule.
        </p>

        {/* Stats row */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Hearings</h3>
            <p className="stat-number">{hearings.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number" style={{ color: "#d97706" }}>{pending}</p>
          </div>
          <div className="stat-card">
            <h3>Scheduled</h3>
            <p className="stat-number" style={{ color: "#1d4ed8" }}>{scheduled}</p>
          </div>
          <div className="stat-card">
            <h3>Resolved / Closed</h3>
            <p className="stat-number" style={{ color: "#166534" }}>{resolved}</p>
          </div>
        </div>

        {/* Hearing Docket */}
        <section className="section-card" style={{ marginTop: "30px" }}>
          <h2 style={{ marginTop: 0 }}>Assigned Docket</h2>

          {loading ? (
            <p>Loading hearings…</p>
          ) : hearings.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No hearings assigned yet.</p>
          ) : (
            hearings.map(h => {
              const statusStyle = STATUS_COLORS[h.outcome] || STATUS_COLORS.Pending;
              const isLocked = h.outcome === "Closed" || h.outcome === "Resolved";
              const isOpen = !isLocked && activeId === h.hearing_id;
              const caseData = h.case || {};

              return (
                <div
                  key={h.hearing_id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    marginBottom: "12px",
                    overflow: "hidden",
                    boxShadow: isOpen ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
                    opacity: isLocked ? 0.75 : 1,
                    transition: "box-shadow 0.2s, opacity 0.2s",
                  }}
                >
                  {/* ── Row header (always visible) ── */}
                  <div
                    onClick={() => !isLocked && togglePanel(h)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 1fr 1fr 130px 140px",
                      gap: "12px",
                      alignItems: "center",
                      padding: "14px 18px",
                      cursor: isLocked ? "default" : "pointer",
                      background: isOpen ? "#f8fafc" : "#fff",
                      userSelect: "none",
                    }}
                  >
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>#{h.hearing_id}</span>

                    <div>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>
                        {caseData.title || "Unknown Case"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {caseData.type} · Client: {caseData.client?.client_name || "—"}
                      </div>
                    </div>

                    <div style={{ fontSize: "0.9rem", color: "#475569" }}>
                      <div>📅 {new Date(h.hearing_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</div>
                      {caseData.lawyer && (
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                          Lawyer: {caseData.lawyer.lawyer_name}
                        </div>
                      )}
                    </div>

                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        textAlign: "center",
                      }}
                    >
                      {h.outcome}
                    </span>

                    <span style={{ color: isLocked ? "#94a3b8" : "#64748b", textAlign: "right", fontSize: "0.85rem" }}>
                      {isLocked ? "🔒 Locked" : isOpen ? "▲ Close" : "▼ Manage"}
                    </span>
                  </div>

                  {/* ── Expandable action panel ── */}
                  {isOpen && (
                    <div style={{ padding: "18px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>

                      {/* Case details strip */}
                      <div style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        marginBottom: "18px",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "8px",
                        fontSize: "0.88rem",
                        color: "#475569",
                      }}>
                        <div><strong>Case ID</strong><br/>#{caseData.case_id}</div>
                        <div><strong>Type</strong><br/>{caseData.type}</div>
                        <div><strong>Filed</strong><br/>{caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString() : "—"}</div>
                        <div><strong>Case Status</strong><br/>{caseData.status}</div>
                        <div><strong>Client</strong><br/>{caseData.client?.client_name || "—"}</div>
                        <div><strong>Lawyer</strong><br/>{caseData.lawyer?.lawyer_name || "—"}</div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                        {/* Status */}
                        <div>
                          <label className="label">Update Status</label>
                          <select
                            value={editForm.outcome}
                            onChange={e => setEditForm(f => ({ ...f, outcome: e.target.value }))}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                          >
                            {["Pending","Scheduled","Adjourned","Resolved","Closed"].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        {/* Reschedule Date */}
                        <div>
                          <label className="label">Reschedule Date</label>
                          <input
                            type="date"
                            value={editForm.hearing_date}
                            onChange={e => setEditForm(f => ({ ...f, hearing_date: e.target.value }))}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                          />
                        </div>

                        {/* Save button */}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleSave(h.hearing_id)}
                            disabled={saving}
                            style={{ padding: "10px 20px", borderRadius: "8px", fontWeight: 600, fontSize: "0.95rem" }}
                          >
                            {saving ? "Saving…" : "Save Changes"}
                          </button>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="label">Judge's Remarks / Notes</label>
                        <textarea
                          rows={3}
                          value={editForm.notes}
                          onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                          placeholder="Add remarks, grounds for adjournment, ruling summary…"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "0.95rem",
                            resize: "vertical",
                            fontFamily: "inherit",
                          }}
                        />
                      </div>

                      {saveMsg && (
                        <p style={{
                          marginTop: "10px",
                          color: saveMsg.startsWith("✓") ? "#166534" : "#dc2626",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}>
                          {saveMsg}
                        </p>
                      )}

                      {/* Existing notes display */}
                      {h.notes && !isOpen && (
                        <div style={{ marginTop: "8px", padding: "10px", background: "#fff", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.88rem", color: "#475569" }}>
                          <strong>Previous remarks:</strong> {h.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}

export default JudgeDashboard;
