import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clientSignUp } from "../api";
import "./Login.css";

function ClientSignup() {
  const [form, setForm] = useState({
    client_name: "",
    address: "",
    phone_no: "",
    email: "",
    user_name: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { client_name, address, phone_no, email, user_name, password, first_name, last_name } = form;

    if (!client_name || !address || !phone_no || !email || !user_name || !password || !first_name || !last_name) {
      setError("All fields are required.");
      setSuccess("");
      return;
    }

    try {
      await clientSignUp(form);
      setSuccess("Account created. Please login.");
      setError("");
      setForm({ client_name: "", address: "", phone_no: "", email: "", user_name: "", password: "", first_name: "", last_name: "" });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "Signup failed");
      setSuccess("");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Client Sign Up</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Client Name"
            value={form.client_name}
            onChange={(e) => setForm({ ...form, client_name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone"
            value={form.phone_no}
            onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Username"
            value={form.user_name}
            onChange={(e) => setForm({ ...form, user_name: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
}

export default ClientSignup;
