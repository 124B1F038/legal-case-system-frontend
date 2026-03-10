import React from "react";
import Sidebar from "../components/Sidebar";

function Reports() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <h1 className="page-title">Case Reports</h1>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>C101</td>
                <td>Property Dispute</td>
                <td>Closed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Reports;