import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { createLawyer, getLawyers } from "../api";

function Lawyers() {
  const [lawyers, setLawyers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ lawyer_name: "", phone_no: "", specialization: "", contact: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLawyers = async () => {
    try {
      const data = await getLawyers();
      setLawyers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  const submit = async () => {
    if (!form.lawyer_name || !form.phone_no || !form.specialization || !form.contact) {
      setError("All fields are required.");
      setSuccess("");
      return;
    }

    try {
      await createLawyer({ ...form, case_count: 0 });
      setSuccess("Lawyer added successfully.");
      setError("");
      setForm({ lawyer_name: "", phone_no: "", specialization: "", contact: "" });
      fetchLawyers(); // Refresh list
      setTimeout(() => setShowForm(false), 1500);
    } catch (err) {
      setError(err.message || "Failed to add lawyer.");
      setSuccess("");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Lawyers Directory</h1>
          <button onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}>
            {showForm ? "Cancel" : "Add New Lawyer"}
          </button>
        </div>

        {showForm && (
          <section className="form-card" style={{ animation: "fadeInText 0.4s ease", marginBottom: "24px" }}>
            <h2 style={{ marginTop: 0 }}>Register Lawyer</h2>
            {error && <p className="error">{error}</p>}
            {success && <p className="success" style={{ color: "#10b981", marginBottom: "10px" }}>{success}</p>}

          <label className="label">Lawyer Name</label>
          <input value={form.lawyer_name} onChange={(e) => setForm({ ...form, lawyer_name: e.target.value })} placeholder="Lawyer Name" />

          <label className="label">Phone</label>
          <input value={form.phone_no} onChange={(e) => setForm({ ...form, phone_no: e.target.value })} placeholder="Phone" />

          <label className="label">Practice Area</label>
          <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}>
            <option value="">Select specialization</option>
            <option value="Criminal Law">Criminal Law</option>
            <option value="Civil Law">Civil Law</option>
            <option value="Corporate Law">Corporate Law</option>
          </select>

          <label className="label">Contact Email</label>
          <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Email or phone" />

          <button onClick={submit} type="button">Add Lawyer</button>
        </section>
        )}

        <section className="section-card">
          <h2 style={{ marginTop: 0 }}>Active Lawyers</h2>
          {loading ? (
            <p>Loading lawyers...</p>
          ) : lawyers.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No lawyers registered in the system.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Practice Area</th>
                    <th>Email/Contact</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {lawyers.map(lw => (
                    <tr key={lw.lawyer_id}>
                      <td>#{lw.lawyer_id}</td>
                      <td style={{ fontWeight: 600 }}>{lw.lawyer_name}</td>
                      <td>
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: "12px", 
                          fontSize: "0.85rem",
                          background: "#e0e7ff",
                          color: "#4f46e5"
                        }}>
                          {lw.specialization}
                        </span>
                      </td>
                      <td>{lw.contact}</td>
                      <td>{lw.phone_no}</td>
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

export default Lawyers;