import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { createCase, getLawyers, getClientProfile, getCases, createDocument, BASE_URL } from "../api";

function Cases() {
  const [casesList, setCasesList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [form, setForm] = useState({ title: "", type: "", client_id: "", lawyer_id: "", filing_date: "" });
  const [docForm, setDocForm] = useState({ doc_type: "", file: null });
  const [lawyers, setLawyers] = useState([]);
  const [isClientUser, setIsClientUser] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedLawyers = await getLawyers();
        setLawyers(fetchedLawyers);

        const role = localStorage.getItem("userRole");
        const username = localStorage.getItem("username");

        const allCases = await getCases();
        
        let clientId = null;
        if (role === "client" && username) {
          setIsClientUser(true);
          const profile = await getClientProfile(username);
          clientId = profile.client_id;
          setForm(prev => ({ ...prev, client_id: clientId }));
          // Filter cases for this client
          setCasesList(allCases.filter(c => c.client_id === clientId));
        } else {
          setCasesList(allCases);
        }
      } catch (err) {
        console.error("Failed to load case form data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const submit = async () => {
    const { title, type, client_id, filing_date } = form;
    if (!title || !type || !client_id || !filing_date) {
      setError("Title, type, client id, and filing date are required.");
      setSuccess("");
      return;
    }

    try {
      const created = await createCase({ ...form, client_id: Number(client_id), lawyer_id: form.lawyer_id ? Number(form.lawyer_id) : null });
      setError("");
      setSuccess("Case created successfully.");
      setForm(prev => ({ ...prev, title: "", type: "", lawyer_id: "", filing_date: "" }));
      // Reload Cases to get full joins
      const allCases = await getCases();
      if (isClientUser) {
          setCasesList(allCases.filter(c => c.client_id === Number(client_id)));
      } else {
          setCasesList(allCases);
      }
      
      // Keep selected case visually in sync if it's the one we're looking at
      if (selectedCase) {
        const reloadedCase = allCases.find(c => c.case_id === selectedCase.case_id);
        if (reloadedCase) setSelectedCase(reloadedCase);
      }
      
      setTimeout(() => setShowForm(false), 1500);
    } catch (err) {
      setError(err.message || "Failed to create case.");
      setSuccess("");
    }
  };

  const uploadDocument = async () => {
    if (!docForm.doc_type || !docForm.file || !selectedCase) {
      setError("Document name and file are required.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("case_id", selectedCase.case_id);
      formData.append("doc_type", docForm.doc_type);
      formData.append("file", docForm.file);

      const created = await createDocument(formData);
      // Update local state for immediate feedback
      setSelectedCase({ ...selectedCase, documents: [...(selectedCase.documents || []), created] });
      setDocForm({ doc_type: "", file: null });
      // Reset file input value
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';
      setError("");
      setSuccess("Document uploaded successfully.");
    } catch (err) {
      setError(err.message || "Failed to upload document.");
      setSuccess("");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Case Management</h1>
          <button onClick={() => { setShowForm(!showForm); setSelectedCase(null); setError(""); setSuccess(""); }}>
            {showForm ? "Cancel" : "Create New Case"}
          </button>
        </div>

        {showForm && (
          <section className="form-card" style={{ animation: "fadeInText 0.4s ease", marginBottom: "24px" }}>
            <h2 style={{ marginTop: 0 }}>Create a Case</h2>
          {error && <p className="error">{error}</p>}
          {success && <p className="success" style={{ color: "#10b981", marginBottom: "10px" }}>{success}</p>}
          {loading && <p style={{ color: "#64748b" }}>Loading form details...</p>}

          <label className="label">Case Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter Case Title" />

          <label className="label">Case Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="">Select Type</option>
            <option value="Civil">Civil</option>
            <option value="Criminal">Criminal</option>
          </select>

          <label className="label">Client ID</label>
          <input 
            value={form.client_id} 
            onChange={(e) => !isClientUser && setForm({ ...form, client_id: e.target.value })} 
            placeholder="Client ID" 
            readOnly={isClientUser}
            style={isClientUser ? { backgroundColor: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed" } : {}}
          />

          <label className="label">Assign Lawyer</label>
          <select value={form.lawyer_id} onChange={(e) => setForm({ ...form, lawyer_id: e.target.value })}>
            <option value="">-- No Lawyer Assigned (Optional) --</option>
            {lawyers.map(lw => (
              <option key={lw.lawyer_id} value={lw.lawyer_id}>
                {lw.lawyer_name} ({lw.specialization})
              </option>
            ))}
          </select>

          <label className="label">Filing Date</label>
          <input type="date" value={form.filing_date} onChange={(e) => setForm({ ...form, filing_date: e.target.value })} />

          <button onClick={submit} type="button">Submit Case</button>
        </section>
        )}

        {selectedCase && !showForm && (
          <section className="section-card" style={{ animation: "fadeInText 0.4s ease", marginBottom: "24px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ marginTop: 0, margin: 0 }}>Case Details: #{selectedCase.case_id} — {selectedCase.title}</h2>
              <button 
                onClick={() => { setSelectedCase(null); setError(""); setSuccess(""); }} 
                style={{ background: "#f1f5f9", color: "#475569", padding: "6px 12px", border: "1px solid #cbd5e1" }}
              >
                Close View
              </button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
              <div>
                <p><strong>Status:</strong> {selectedCase.status}</p>
                <p><strong>Type:</strong> {selectedCase.type}</p>
                <p><strong>Filed:</strong> {new Date(selectedCase.filing_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Client:</strong> {selectedCase.client?.client_name || "Unknown"}</p>
                <p><strong>Lawyer:</strong> {selectedCase.lawyer ? `${selectedCase.lawyer.lawyer_name} (${selectedCase.lawyer.specialization})` : "Unassigned"}</p>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px solid #e2e8f0", margin: "20px 0" }} />

            <h3 style={{ marginTop: 0, fontSize: "1.1rem" }}>Documents</h3>
            {(!selectedCase.documents || selectedCase.documents.length === 0) ? (
              <p style={{ color: "#94a3b8" }}>No documents uploaded for this case yet.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0" }}>
                {selectedCase.documents.map(doc => (
                  <li key={doc.doc_id} style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      📄 <strong>{doc.doc_type}</strong> 
                      <span style={{ color: "#64748b", fontSize: "0.85rem", marginLeft: "8px" }}>
                        ({doc.file_path.split('/').pop()})
                      </span>
                    </div>
                    <a 
                      href={`${BASE_URL}${doc.file_path}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ padding: "6px 12px", background: "#e0f2fe", color: "#0284c7", borderRadius: "6px", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}
                    >
                      View Doc
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginTop: "16px" }}>
              <h4 style={{ margin: "0 0 10px 0" }}>Upload New Document</h4>
              {error && <p className="error" style={{ fontSize: "0.85rem", padding: "6px" }}>{error}</p>}
              {success && <p className="success" style={{ fontSize: "0.85rem", padding: "6px" }}>{success}</p>}
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label className="label" style={{ fontSize: "0.8rem", marginBottom: "4px" }}>Document Name / Description</label>
                  <input value={docForm.doc_type} onChange={e => setDocForm({...docForm, doc_type: e.target.value})} placeholder="e.g. Initial Complaint PDF" style={{ margin: 0 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label" style={{ fontSize: "0.8rem", marginBottom: "4px" }}>Select File</label>
                  <input id="file-upload-input" type="file" onChange={e => setDocForm({...docForm, file: e.target.files[0]})} style={{ margin: 0, paddingBottom: "10px" }} />
                </div>
                <button onClick={uploadDocument} type="button" style={{ padding: "10px 20px" }}>Upload</button>
              </div>
            </div>

          </section>
        )}

        <section className="section-card">
          <h2 style={{ marginTop: 0 }}>{isClientUser ? "My Active Cases" : "All Cases"}</h2>
          {loading ? (
            <p>Loading cases...</p>
          ) : casesList.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No cases found.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    {!isClientUser && <th>Client Name</th>}
                    <th>Filing Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {casesList.map(c => (
                    <tr key={c.case_id}>
                      <td>#{c.case_id}</td>
                      <td>{c.title}</td>
                      <td>{c.type}</td>
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
                      {!isClientUser && <td>{c.client ? c.client.client_name : c.client_id}</td>}
                      <td>{new Date(c.filing_date).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => { setSelectedCase(c); setShowForm(false); setError(""); setSuccess(""); }}
                          style={{ 
                            padding: "4px 12px", 
                            fontSize: "0.85rem", 
                            background: selectedCase?.case_id === c.case_id ? "#3b82f6" : "#f1f5f9",
                            color: selectedCase?.case_id === c.case_id ? "#fff" : "#475569",
                            border: "1px solid #cbd5e1"
                          }}
                        >
                          View Details
                        </button>
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

export default Cases;