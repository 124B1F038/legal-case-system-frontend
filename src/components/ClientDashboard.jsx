import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getClientDashboardStats } from "../api";

function ClientDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    openCases: 0,
    pendingDocuments: 0,
    nextHearing: "Loading...",
    unreadMessages: 0
  });

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");

    if (!isAuth || role !== "client") {
      navigate("/");
      return;
    }

    if (username) {
      getClientDashboardStats(username)
        .then(setStats)
        .catch(console.error);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="page-title">Client Dashboard</h1>
          <button style={{ padding: "8px 12px", background: "#e04d4d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }} onClick={handleLogout}>Logout</button>
        </div>
        <section className="grid-4">
          <article className="stats-card">
            <div className="label">My Open Cases</div>
            <div className="stats-number">{stats.openCases}</div>
          </article>
          <article className="stats-card">
            <div className="label">Total Documents</div>
            <div className="stats-number">{stats.pendingDocuments}</div>
          </article>
          <article className="stats-card">
            <div className="label">Next Hearing</div>
            <div className="stats-number" style={{ fontSize: "1.5rem" }}>{stats.nextHearing}</div>
          </article>
          <article className="stats-card">
            <div className="label">Unread Messages</div>
            <div className="stats-number">{stats.unreadMessages}</div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default ClientDashboard;