import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Monitoring = () => {
  const [activeSection, setActiveSection] = useState("machine");
  const [cameraOn, setCameraOn] = useState({ gate: false, machine: false });
  const navigate = useNavigate();

  const toggleCamera = async (cameraType) => {
    const action = cameraOn[cameraType] ? "off" : "on";

    try {
      const response = await fetch("http://127.0.0.1:7755/toggle_camera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ camera_type: cameraType, action }),
      });

      const data = await response.json();
      if (response.ok) {
        setCameraOn((prevState) => ({ ...prevState, [cameraType]: !prevState[cameraType] }));
      } else {
        console.error(`Error toggling ${cameraType} camera:`, data.error);
      }
    } catch (error) {
      console.error("Error connecting to Flask server:", error);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
        ⬅ Back to Dashboard
      </button>

      <h1 style={styles.heading}>Monitoring</h1>

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tabButton,
            backgroundColor: activeSection === "gate" ? "#007bff" : "#ddd",
          }}
          onClick={() => setActiveSection("gate")}
        >
          Gate Entry
        </button>
        <button
          style={{
            ...styles.tabButton,
            backgroundColor: activeSection === "machine" ? "#007bff" : "#ddd",
          }}
          onClick={() => setActiveSection("machine")}
        >
          Machine Side
        </button>
      </div>

      <div style={styles.content}>
        {activeSection === "gate" ? (
          <div>
            <h2>Gate Entry Monitoring</h2>
            <button
              onClick={() => toggleCamera("gate")}
              style={{
                ...styles.toggleButton,
                background: cameraOn.gate ? "#f44336" : "#007bff",
                cursor: "pointer",
              }}
            >
              {cameraOn.gate ? "Turn Gate Camera Off" : "Turn Gate Camera On"}
            </button>

            {cameraOn.gate && (
              <div style={styles.videoFeed}>
                <img
                  src="http://127.0.0.1:7755/video_feed/gate"
                  alt="Gate Video Stream"
                  style={{ width: "100%", marginTop: "20px", borderRadius: "10px" }}
                />
              </div>
            )}

            {!cameraOn.gate && (
              <p style={{ marginTop: "20px" }}>
                Gate camera is off. Please turn it on to start monitoring.
              </p>
            )}
          </div>
        ) : (
          <div>
            <h2>Machine Side Monitoring</h2>
            <button
              onClick={() => toggleCamera("machine")}
              style={{
                ...styles.toggleButton,
                background: cameraOn.machine ? "#f44336" : "#007bff",
                cursor: "pointer",
              }}
            >
              {cameraOn.machine ? "Turn Machine Camera Off" : "Turn Machine Camera On"}
            </button>

            {cameraOn.machine && (
              <div style={styles.videoFeed}>
                <img
                  src="http://127.0.0.1:7755/video_feed/machine"
                  alt="Machine Video Stream"
                  style={{ width: "100%", marginTop: "20px", borderRadius: "10px" }}
                />
              </div>
            )}

            {!cameraOn.machine && (
              <p style={{ marginTop: "20px" }}>
                Machine camera is off. Please turn it on to start monitoring.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// CSS Styles
const styles = {
  container: { textAlign: "center", padding: "20px", maxWidth: "600px", margin: "0 auto" },
  backButton: { padding: "10px 15px", backgroundColor: "#f44336", color: "#fff", borderRadius: "5px", cursor: "pointer", marginBottom: "20px" },
  heading: { fontSize: "24px", marginBottom: "20px" },
  tabs: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" },
  tabButton: { padding: "10px 20px", borderRadius: "5px", cursor: "pointer", color: "#fff" },
  content: { border: "1px solid #ddd", padding: "20px", borderRadius: "10px", backgroundColor: "#f9f9f9" },
  toggleButton: { padding: "10px 20px", color: "#fff", borderRadius: "5px" },
};

export default Monitoring;
