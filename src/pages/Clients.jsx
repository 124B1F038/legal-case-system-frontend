import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getClients, createClient, getCases } from "../api";

function Clients() {
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [form, setForm] = useState({ client_name: "", address: "", phone_no: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const cls = await getClients();
      const css = await getCases();
      setClients(cls);
      setCases(css);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submit = async () => {
    if (!form.client_name || !form.address || !form.phone_no || !form.email || !form.password) {
      setError("All fields are required.");
      setSuccess("");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email.");
      setSuccess("");
      return;
    }

    try {
      await createClient(form);
      setForm({ client_name: "", address: "", phone_no: "", email: "", password: "" });
      loadData();
      setSuccess("Client added successfully.");
      setError("");
      setTimeout(() => setShowForm(false), 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save client.");
      setSuccess("");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Client Management</h1>
          <button onClick={() => { setShowForm(!showForm); setSelectedClient(null); setError(""); setSuccess(""); }}>
            {showForm ? "Cancel" : "Create New Client"}
          </button>
        </div>

        {showForm && (
          <section className="form-card" style={{ animation: "fadeInText 0.4s ease", marginBottom: "24px" }}>
            <h2 style={{ marginTop: 0 }}>Register Client</h2>
            {error && <p className="error">{error}</p>}
            {success && <p className="success" style={{ color: "#10b981", marginBottom: "10px" }}>{success}</p>}

          <label className="label">Client Name</label>
          <input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />

          <label className="label">Address</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

          <label className="label">Phone</label>
          <input value={form.phone_no} onChange={(e) => setForm({ ...form, phone_no: e.target.value })} />

          <label className="label">Email</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <label className="label">Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <button onClick={submit} type="button">Save Client</button>
        </section>
        )}

        {selectedClient && !showForm && (
          <section className="section-card" style={{ animation: "fadeInText 0.4s ease", marginBottom: "24px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ marginTop: 0, margin: 0 }}>Case History: {selectedClient.client_name}</h2>
              <button 
                onClick={() => setSelectedClient(null)} 
                style={{ background: "#f1f5f9", color: "#475569", padding: "6px 12px", border: "1px solid #cbd5e1" }}
              >
                Close View
              </button>
            </div>
            
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Date Filed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.filter(c => c.client_id === selectedClient.client_id).length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: "center", color: "#94a3b8" }}>No active cases for this client.</td></tr>
                  ) : (
                    cases.filter(c => c.client_id === selectedClient.client_id).map(c => (
                      <tr key={c.case_id}>
                        <td>#{c.case_id}</td>
                        <td style={{ fontWeight: 500 }}>{c.title}</td>
                        <td>{c.type}</td>
                        <td>{new Date(c.filing_date).toLocaleDateString()}</td>
                        <td>
                          <span style={{ 
                            padding: "4px 8px", 
                            borderRadius: "12px", 
                            fontSize: "0.85rem",
                            background: c.status === "Open" ? "#e0f2fe" : "#f1f5f9",
                            color: c.status === "Open" ? "#0284c7" : "#475569"
                          }}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="section-card">
          <h2 style={{ marginTop: 0 }}>Registered Clients</h2>
          {loading ? (
            <p>Loading clients...</p>
          ) : clients.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No clients registered.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => {
                    const clientCaseCount = cases.filter(cCase => cCase.client_id === c.client_id).length;
                    
                    return (
                      <tr key={c.client_id}>
                        <td>#{c.client_id}</td>
                        <td style={{ fontWeight: 600 }}>{c.client_name}</td>
                        <td>{c.email}</td>
                        <td>{c.phone_no}</td>
                        <td>
                          <button 
                            onClick={() => { setSelectedClient(c); setShowForm(false); }}
                            style={{ 
                              padding: "4px 12px", 
                              fontSize: "0.85rem", 
                              background: selectedClient?.client_id === c.client_id ? "#3b82f6" : "#f1f5f9",
                              color: selectedClient?.client_id === c.client_id ? "#fff" : "#475569",
                              border: "1px solid #cbd5e1"
                            }}
                          >
                            View Cases ({clientCaseCount})
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Clients;