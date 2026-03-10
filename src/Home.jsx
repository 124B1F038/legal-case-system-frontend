import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home-orb-3"></div>
      <div className="info-card">
        <h1>Legal Case & Document Management</h1>
        <p>
          Simplify case tracking, client communication, document management, and hearing schedules in one intuitive portal.
        </p>

        <div className="home-links">
          <button className="user" onClick={() => navigate("/login")}><span>Sign In To Portal</span></button>
        </div>
      </div>
    </div>
  );
}

export default Home;

