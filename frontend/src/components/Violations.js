import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Violations.css";

const Violations = () => {
    const [violations, setViolations] = useState([]);
    const [filteredViolations, setFilteredViolations] = useState([]);
    const [filter, setFilter] = useState("All");
    const [locationFilter, setLocationFilter] = useState("All");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchViolations = async () => {
            const token = localStorage.getItem("token");

            try {
                const response = await fetch("http://localhost:7755/api/violations", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setViolations(data);
                    setFilteredViolations(data); // Initially show all
                } else {
                    console.error("Failed to fetch violations");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchViolations();
    }, []);

    // Function to filter violations based on selected time frame and location
    const filterViolations = (timeFilter, location) => {
        const now = new Date();
        let filtered = violations;

        // Apply time-based filter
        if (timeFilter === "Today") {
            filtered = filtered.filter(v => new Date(v.timestamp).toDateString() === now.toDateString());
        } else if (timeFilter === "Yesterday") {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            filtered = filtered.filter(v => new Date(v.timestamp).toDateString() === yesterday.toDateString());
        } else if (timeFilter === "Monthly") {
            filtered = filtered.filter(v => {
                const violationDate = new Date(v.timestamp);
                return violationDate.getMonth() === now.getMonth() && violationDate.getFullYear() === now.getFullYear();
            });
        }

        // Apply location-based filter
        if (location !== "All") {
            filtered = filtered.filter(v => v.camera_location === location);
        }

        setFilter(timeFilter);
        setLocationFilter(location);
        setFilteredViolations(filtered);
    };

    // PDF Generation based on filtered violations
    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text(`Safety Violations Report (${filter}, ${locationFilter})`, 14, 10);

        const columns = ["ID", "Location", "Detected Gear", "Missing Gear", "Timestamp"];
        const rows = filteredViolations.map(v => [
            v.id,
            v.camera_location,
            v.detected_gear,
            v.missing_gear,
            new Date(v.timestamp).toLocaleString()
        ]);

        autoTable(doc, { head: [columns], body: rows, startY: 20 });

        doc.save(`safety_violations_report_${filter}_${locationFilter}.pdf`);
    };

    return (
        <div className="violations-container">
            <h1 className="violations-title">Logged Safety Violations</h1>

            <div className="filters-container">
                {/* Time Filter Dropdown */}
                <select
                    className="filter-dropdown"
                    value={filter}
                    onChange={(e) => filterViolations(e.target.value, locationFilter)}
                >
                    <option value="All">All</option>
                    <option value="Today">Today</option>
                    <option value="Yesterday">Yesterday</option>
                    <option value="Monthly">Monthly</option>
                </select>

                {/* Location Filter Dropdown */}
                <select
                    className="filter-dropdown"
                    value={locationFilter}
                    onChange={(e) => filterViolations(filter, e.target.value)}
                >
                    <option value="All">All Locations</option>
                    <option value="machine">Machine Area</option>
                    <option value="gate">Gate</option>
                </select>
            </div>

            <div className="button-container">
                <button className="button back-button" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>
                <button className="button download-button" onClick={generatePDF}>
                    Download {filter} {locationFilter} Report
                </button>
            </div>

            {filteredViolations.length > 0 ? (
                <table className="violations-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Location</th>
                            <th>Detected Gear</th>
                            <th>Missing Gear</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredViolations.map((violation) => (
                            <tr key={violation.id}>
                                <td>{violation.id}</td>
                                <td>{violation.camera_location}</td>
                                <td>{violation.detected_gear}</td>
                                <td>{violation.missing_gear}</td>
                                <td>{new Date(violation.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="no-violations">No safety violations recorded for {filter} at {locationFilter}.</p>
            )}
        </div>
    );
};

export default Violations;
