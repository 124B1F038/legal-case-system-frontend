import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userLogin, clientLogin } from "../api";
import "./Login.css";

function UnifiedLogin() {
  const [role, setRole] = useState("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (role === "admin" || role === "lawyer" || role === "judge") {
        // userLogin handles the User table which contains these roles
        const userData = await userLogin({ user_name: username, password });
        // Basic check to ensure the user isn't logging in with the wrong dropdown
        if (userData.role !== role) {
           setError(`Invalid credentials for role: ${role}`);
           return;
        }
        localStorage.setItem("username", userData.user_name);
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userId", userData.user_id);
        
        // Route according to their actual role
        if (userData.role === "admin") {
          navigate("/dashboard");
        } else if (userData.role === "lawyer") {
          navigate("/lawyer-dashboard");
        } else if (userData.role === "judge") {
          navigate("/judge-dashboard");
        }
      } else if (role === "client") {
        const clientData = await clientLogin({ user_name: username, password });
        localStorage.setItem("username", clientData.user_name);
        localStorage.setItem("userRole", "client");
        localStorage.setItem("isAuthenticated", "true");
        if (clientData.user_id) localStorage.setItem("userId", clientData.user_id);
        navigate("/client-dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>System Login</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleLogin}>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            style={{ 
              width: "100%", 
              marginBottom: "14px", 
              padding: "14px 16px", 
              borderRadius: "12px", 
              border: "1px solid rgba(148, 163, 184, 0.3)", 
              fontSize: "1rem",
              background: "rgba(255, 255, 255, 0.7)",
              color: "#1e293b"
            }}
          >
            <option value="admin">Administrator</option>
            <option value="client">Client</option>
            <option value="lawyer">Lawyer</option>
            <option value="judge">Judge</option>
          </select>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit"><span>Login</span></button>
        </form>

        {role === "client" && (
          <p className="signup-line">
            New Client? <Link className="signup-link" to="/client-signup">Sign up</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default UnifiedLogin;
