import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { getCases } from "../api";
import { BASE_URL } from "../api";

const API_URL = `${BASE_URL}/api`;

function Documents() {
  const [cases, setCases]       = useState([]);
  const [form, setForm]         = useState({ case_id: "", doc_type: "", file: null });
  const [documents, setDocuments] = useState([]);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const role = localStorage.getItem("userRole");
  const isAdmin = role === "admin";

  // Fetch cases for admin dropdown, and all documents
  useEffect(() => {
    async function load() {
      try {
        if (isAdmin) {
          const c = await getCases();
          setCases(c);
        }
        const res = await fetch(`${API_URL}/documents`);
        if (res.ok) setDocuments(await res.json());
      } catch (err) {
        console.error("Failed to load:", err);
      }
    }
    load();
  }, []);

  const handleSubmit = async () => {
    if (!form.case_id || !form.doc_type || !form.file) {
      setError("Please select a case, document type, and a file.");
      setSuccess("");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("case_id", form.case_id);
      fd.append("doc_type", form.doc_type);
      fd.append("file", form.file);

      const res = await fetch(`${API_URL}/documents`, { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Upload failed");
      }
      const doc = await res.json();
      setDocuments(prev => [doc, ...prev]);
      setSuccess("Document uploaded successfully.");
      setError("");
      setForm({ case_id: "", doc_type: "", file: null });
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err.message || "Upload failed.");
      setSuccess("");
    } finally {
      setUploading(false);
    }
  };

  const DOC_TYPES = ["Contract", "Evidence", "Court Order", "Affidavit", "Petition", "Judgment", "Correspondence", "Other"];

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <h1 className="page-title">Documents</h1>

        {/* Upload form — visible to admin & lawyer */}
        {(isAdmin || role === "lawyer") && (
          <section className="section-card" style={{ marginBottom: "28px" }}>
            <h2 style={{ marginTop: 0 }}>Upload Document</h2>

            {error   && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {/* Case selector */}
              <div>
                <label className="label">Select Case</label>
                {isAdmin ? (
                  <select
                    value={form.case_id}
                    onChange={e => setForm({ ...form, case_id: e.target.value })}
                  >
                    <option value="">-- Choose a Case --</option>
                    {cases.map(c => (
                      <option key={c.case_id} value={c.case_id}>
                        #{c.case_id} — {c.title} ({c.status})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    placeholder="Case ID"
                    value={form.case_id}
                    onChange={e => setForm({ ...form, case_id: e.target.value })}
                  />
                )}
              </div>

              {/* Doc type */}
              <div>
                <label className="label">Document Type</label>
                <select
                  value={form.doc_type}
                  onChange={e => setForm({ ...form, doc_type: e.target.value })}
                >
                  <option value="">-- Select Type --</option>
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* File picker */}
            <div style={{ marginTop: "14px" }}>
              <label className="label">Choose File</label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  background: "#fff",
                  cursor: "pointer",
                }}
                onChange={e => setForm({ ...form, file: e.target.files[0] || null })}
              />
              {form.file && (
                <span style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "6px", display: "block" }}>
                  Selected: {form.file.name} ({(form.file.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={uploading}
              style={{ marginTop: "18px", minWidth: "140px" }}
            >
              {uploading ? "Uploading…" : "Upload Document"}
            </button>
          </section>
        )}

        {/* Document list */}
        <section className="section-card">
          <h2 style={{ marginTop: 0 }}>All Documents</h2>
          {documents.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No documents uploaded yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Doc ID</th>
                    <th>Case ID</th>
                    <th>Type</th>
                    <th>File</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(d => (
                    <tr key={d.doc_id}>
                      <td>#{d.doc_id}</td>
                      <td>#{d.case_id}</td>
                      <td>{d.doc_type}</td>
                      <td>
                        <a
                          href={`${BASE_URL}${d.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}
                        >
                          📄 View / Download
                        </a>
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

export default Documents;