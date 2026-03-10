import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getDashboardStats } from "../api";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clients: 0, lawyers: 0, cases: 0, hearings: 0 });

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    
    if (!isAuth || (role !== "Admin" && role !== "admin")) {
      navigate("/");
      return;
    }
    
    getDashboardStats().then(setStats).catch(console.error);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    window.location.href = "/";
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="page-title">Dashboard</h1>
          <button style={{ padding: "8px 12px", background: "#e04d4d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }} onClick={handleLogout}>Logout</button>
        </div>

        <section className="grid-4">
          <article className="stats-card">
            <div className="label">Total Clients</div>
            <div className="stats-number">{stats.clients}</div>
          </article>

          <article className="stats-card">
            <div className="label">Lawyers</div>
            <div className="stats-number">{stats.lawyers}</div>
          </article>

          <article className="stats-card">
            <div className="label">Active Cases</div>
            <div className="stats-number">{stats.cases}</div>
          </article>

          <article className="stats-card">
            <div className="label">Upcoming Hearings</div>
            <div className="stats-number">{stats.hearings}</div>
          </article>
        </section>

        <section className="section-card" style={{ marginTop: "20px" }}>
          <h2 className="label">Quick Actions</h2>
          <div className="home-links" style={{ marginTop: "14px" }}>
            <button onClick={() => window.location.assign("/cases")}>Create New Case</button>
            <button onClick={() => window.location.assign("/clients")}>Add Client</button>
            <button onClick={() => window.location.assign("/hearings")}>Schedule Hearing</button>
            <button onClick={() => window.location.assign("/documents")}>Upload Document</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;