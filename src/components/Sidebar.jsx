import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { FaHome, FaUsers, FaUserTie, FaGavel, FaFileAlt, FaCalendarAlt, FaChartBar, FaBell, FaSignOutAlt } from "react-icons/fa";

import "./sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    navigate("/");
  };

  const role = localStorage.getItem("userRole");
  const isClient = role === "client";
  const isLawyer = role === "lawyer";
  const isJudge = role === "judge";
  const isAdmin = role === "admin";

  let dashboardRoot = "/dashboard";
  if (isClient) dashboardRoot = "/client-dashboard";
  if (isLawyer) dashboardRoot = "/lawyer-dashboard";
  if (isJudge) dashboardRoot = "/judge-dashboard";

  return (
    <div className="sidebar">

      <h2 className="logo">Legal System</h2>

      <ul className="menu">

        <li>
          <NavLink to={dashboardRoot} className="menu-link">
            <FaHome className="icon"/>
            <span>Dashboard</span>
          </NavLink>
        </li>

        {isAdmin && (
          <li>
            <NavLink to="/clients" className="menu-link">
              <FaUsers className="icon"/>
              <span>Clients</span>
            </NavLink>
          </li>
        )}

        {isAdmin && (
          <li>
            <NavLink to="/lawyers" className="menu-link">
              <FaUserTie className="icon"/>
              <span>Lawyers</span>
            </NavLink>
          </li>
        )}
        
        {isAdmin && (
          <li>
            <NavLink to="/judges" className="menu-link">
              <FaGavel className="icon"/>
              <span>Judges</span>
            </NavLink>
          </li>
        )}

        {(!isJudge) && (
          <li>
            <NavLink to="/cases" className="menu-link">
              <FaGavel className="icon"/>
              <span>{isClient ? "My Cases" : isLawyer ? "Assigned Cases" : "Cases"}</span>
            </NavLink>
          </li>
        )}

        {(isAdmin || isLawyer) && (
          <li>
            <NavLink to="/documents" className="menu-link">
              <FaFileAlt className="icon"/>
              <span>Documents</span>
            </NavLink>
          </li>
        )}

        {(!isClient && !isLawyer) && (
          <li>
            <NavLink to="/hearings" className="menu-link">
              <FaCalendarAlt className="icon"/>
              <span>Hearings</span>
            </NavLink>
          </li>
        )}

        {isAdmin && (
          <li>
            <NavLink to="/reports" className="menu-link">
              <FaChartBar className="icon"/>
              <span>Reports</span>
            </NavLink>
          </li>
        )}

        <li>
          <NavLink to="/notifications" className="menu-link">
            <FaBell className="icon"/>
            <span>Notifications</span>
          </NavLink>
        </li>

        <li>
          <button className="menu-link logout-link" onClick={handleLogout}>
            <FaSignOutAlt className="icon" />
            <span>Logout</span>
          </button>
        </li>

      </ul>

    </div>
  );
}

export default Sidebar;