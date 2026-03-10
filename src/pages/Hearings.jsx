import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { createHearing, getHearings, getClientProfile, getCases, getJudges } from "../api";

function Hearings() {
  const [hearingsList, setHearingsList] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [judges, setJudges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ case_id: "", hearing_date: "", judge_id: "", outcome: "Pending" });
  const [isClientUser, setIsClientUser] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const role = localStorage.getItem("userRole");
        const username = localStorage.getItem("username");
        const hearingsData = await getHearings();
        const casesData = await getCases();
        const judgesData = await getJudges();

        setAllCases(casesData);
        setJudges(judgesData);

        if (role === "client" && username) {
          setIsClientUser(true);
          const profile = await getClientProfile(username);
          // Only show hearings where the case belongs to this client
          const myHearings = hearingsData.filter(h => h.case && h.case.client_id === profile.client_id);
          setHearingsList(myHearings);
        } else {
          setHearingsList(hearingsData);
        }
      } catch (err) {
        console.error("Failed to load hearings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const submit = async () => {
    if (!form.case_id || !form.hearing_date || !form.judge_id || !form.outcome) {
      setError("All fields are required.");
      setSuccess("");
      return;
    }

    try {
      const created = await createHearing({ case_id: Number(form.case_id), hearing_date: form.hearing_date, judge_id: Number(form.judge_id), outcome: form.outcome });
      setError("");
      setSuccess("Hearing added successfully.");
      setForm({ case_id: "", hearing_date: "", judge_id: "", outcome: "Pending" });
      
      // Update local state by finding the corresponding case
      const matchingCase = allCases.find(c => c.case_id === Number(created.case_id));
      const matchingJudge = judges.find(j => j.judge_id === Number(created.judge_id));
      setHearingsList([...hearingsList, { ...created, case: matchingCase || { case_id: created.case_id }, judge: matchingJudge || { judge_name: "Unknown" } }]);
      setTimeout(() => setShowForm(false), 1500);
    } catch (err) {
      setError(err.message || "Failed to add hearing.");
      setSuccess("");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Hearings Dashboard</h1>
          {!isClientUser && (
            <button onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}>
              {showForm ? "Cancel" : "Schedule Hearing"}
            </button>
          )}
        </div>

        {showForm && !isClientUser && (
          <section className="form-card" style={{ animation: "fadeInText 0.4s ease", marginBottom: "24px" }}>
            <h2 style={{ marginTop: 0 }}>Schedule New Hearing</h2>
            {error && <p className="error">{error}</p>}
            {success && <p className="success" style={{ color: "#10b981", marginBottom: "10px" }}>{success}</p>}

          <label className="label">Select Case</label>
          <select value={form.case_id} onChange={(e) => setForm({ ...form, case_id: e.target.value })}>
            <option value="">-- Choose a Case --</option>
            {allCases.map(c => (
              <option key={c.case_id} value={c.case_id}>
                #{c.case_id} - {c.title} ({c.client ? c.client.client_name : "Unknown Client"})
              </option>
            ))}
          </select>

          {form.case_id && (() => {
            const selected = allCases.find(c => c.case_id.toString() === form.case_id.toString());
            if (!selected) return null;
            return (
              <div style={{ padding: "12px", background: "#f1f5f9", borderRadius: "8px", marginBottom: "15px", fontSize: "0.9rem", color: "#475569" }}>
                <strong>Case Type:</strong> {selected.type} <br/>
                <strong>Filed On:</strong> {new Date(selected.filing_date).toLocaleDateString()}
              </div>
            );
          })()}

          <label className="label">Hearing Date</label>
          <input type="date" value={form.hearing_date} onChange={(e) => setForm({ ...form, hearing_date: e.target.value })} />

          <label className="label">Assigned Judge <span style={{fontSize: "0.8rem", color: "#64748b", fontWeight: "normal"}}>(Admin controlled)</span></label>
          <select value={form.judge_id} onChange={(e) => setForm({ ...form, judge_id: e.target.value })}>
            <option value="">-- Select a Judge --</option>
            {judges.map(j => (
              <option key={j.judge_id} value={j.judge_id}>
                {j.judge_name} ({j.qualification})
              </option>
            ))}
          </select>

          <label className="label">Outcome Status</label>
          <select value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })}>
            <option value="Pending">Pending</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Adjourned">Adjourned</option>
            <option value="Resolved">Resolved</option>
          </select>

          <button onClick={submit} type="button">Save Hearing</button>
        </section>
        )}

        <section className="section-card">
          <h2 style={{ marginTop: 0 }}>{isClientUser ? "My Scheduled Hearings" : "All Hearings"}</h2>
          {loading ? (
            <p>Loading hearings...</p>
          ) : hearingsList.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No hearings found.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Hearing ID</th>
                    <th>Case ID</th>
                    <th>Case Title</th>
                    <th>Date</th>
                    <th>Judge</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hearingsList.map(h => (
                    <tr key={h.hearing_id}>
                      <td>#{h.hearing_id}</td>
                      <td>#{h.case_id}</td>
                      <td>{h.case ? h.case.title : "N/A"}</td>
                      <td>{new Date(h.hearing_date).toLocaleDateString()}</td>
                      <td>{h.judge ? h.judge.judge_name : "N/A"}</td>
                      <td>
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: "12px", 
                          fontSize: "0.85rem",
                          background: h.outcome === "Pending" ? "#fef3c7" : "#e2e8f0",
                          color: h.outcome === "Pending" ? "#d97706" : "#475569"
                        }}>
                          {h.outcome}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Hearings;