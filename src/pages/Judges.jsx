import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { createJudge, getJudges } from "../api";

function Judges() {
  const [judges, setJudges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ judge_name: "", qualification: "", email: "", phone_no: "", user_name: "", password: "", first_name: "", last_name: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchJudges = async () => {
    try {
      const data = await getJudges();
      setJudges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJudges();
  }, []);

  const submit = async () => {
    if (!form.judge_name || !form.qualification || !form.email || !form.phone_no || !form.user_name || !form.password || !form.first_name || !form.last_name) {
      setError("All fields are required.");
      setSuccess("");
      return;
    }

    try {
      await createJudge(form);
      setSuccess("Judge registered successfully.");
      setError("");
      setForm({ judge_name: "", qualification: "", email: "", phone_no: "", user_name: "", password: "", first_name: "", last_name: "" });
      fetchJudges(); // Refresh list
      setTimeout(() => setShowForm(false), 1500);
    } catch (err) {
      setError(err.message || "Failed to add judge.");
      setSuccess("");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Judges Directory</h1>
          <button onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}>
            {showForm ? "Cancel" : "Register Judge"}
          </button>
        </div>

        {showForm && (
          <section className="form-card" style={{ animation: "fadeInText 0.4s ease", marginBottom: "24px" }}>
            <h2 style={{ marginTop: 0 }}>Register Judge</h2>
            {error && <p className="error">{error}</p>}
            {success && <p className="success" style={{ color: "#10b981", marginBottom: "10px" }}>{success}</p>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label className="label">Judge Full Name</label>
              <input value={form.judge_name} onChange={(e) => setForm({ ...form, judge_name: e.target.value })} placeholder="Full Name (e.g., Hon. Jane Doe)" />
            </div>
            <div>
              <label className="label">Qualification / Degree</label>
              <input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="Qualification (e.g., L.L.B, J.D.)" />
            </div>
            <div>
              <label className="label">Contact Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email Address" />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input value={form.phone_no} onChange={(e) => setForm({ ...form, phone_no: e.target.value })} placeholder="Phone Number" />
            </div>
          </div>
          
          <h3 style={{ marginTop: "16px", marginBottom: "8px", fontSize: "1.1rem" }}>Login Credentials</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
             <div>
              <label className="label">First Name</label>
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="First Name" />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Last Name" />
            </div>
            <div>
              <label className="label">Username</label>
              <input value={form.user_name} onChange={(e) => setForm({ ...form, user_name: e.target.value })} placeholder="Username" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" />
            </div>
          </div>

          <button onClick={submit} type="button" style={{ marginTop: "16px" }}>Complete Registration</button>
        </section>
        )}

        <section className="section-card">
          <h2 style={{ marginTop: 0 }}>Active Judges</h2>
          {loading ? (
            <p>Loading judges...</p>
          ) : judges.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No judges registered in the system.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Qualification</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {judges.map(jd => (
                    <tr key={jd.judge_id}>
                      <td>#{jd.judge_id}</td>
                      <td style={{ fontWeight: 600 }}>{jd.judge_name}</td>
                      <td>
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: "12px", 
                          fontSize: "0.85rem",
                          background: "#e0f2fe",
                          color: "#0369a1"
                        }}>
                          {jd.qualification}
                        </span>
                      </td>
                      <td>{jd.email}</td>
                      <td>{jd.phone_no}</td>
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

export default Judges;
