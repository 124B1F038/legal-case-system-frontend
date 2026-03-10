import React from "react";
import Sidebar from "../components/Sidebar";

function ClientSystem() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <h1 className="page-title">Client System Dashboard</h1>
        <p>View your cases, documents and hearing updates</p>
      </main>
    </div>
  );
}

export default ClientSystem;