import React from "react";
import "./Login.css";

function UserLogin() {
  return (
    <div className="login-page">

      <div className="login-box">

        <h2>User Login</h2>

        <input type="text" placeholder="Username" />

        <input type="password" placeholder="Password" />

        <button className="login-btn">Login</button>

      </div>

    </div>
  );
}

export default UserLogin;