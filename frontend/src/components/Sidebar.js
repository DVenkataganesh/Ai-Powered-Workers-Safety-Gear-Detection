import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Dashboard</h2>
      <ul>
        <li><Link to="/dashboard">Home</Link></li>
        <li><Link to="/violations">Violations</Link></li>
        <li><Link to="/monitoring">Monitoring</Link></li>
        <li><Link to="/worker-registration">Register Worker</Link></li>
        <li><Link to="/view-workers">View Workers</Link></li>  {/* ✅ Added View Workers Link */}
      </ul>
    </div>
  );
};

export default Sidebar;
