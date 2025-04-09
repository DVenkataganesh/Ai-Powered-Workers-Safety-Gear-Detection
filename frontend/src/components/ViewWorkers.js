import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewWorkers = () => {
    const [workers, setWorkers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkers = async () => {
            // Retrieve the JWT token from local storage
            const token = localStorage.getItem("token");

            try {
                const response = await fetch("http://localhost:7755/api/workers", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}` // Include the Authorization header
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setWorkers(data);
                } else if (response.status === 403) {
                    toast.error("Access denied! You don't have the required permissions.");
                    navigate("/login"); // Redirect to login if unauthorized
                } else {
                    toast.error("Failed to fetch workers.");
                }
            } catch (error) {
                toast.error("Error fetching workers.");
                console.error("Error:", error);
            }
        };

        fetchWorkers();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this worker?")) return;

        // Retrieve the JWT token from local storage
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:7755/api/workers/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}` // Include the Authorization header
                }
            });

            if (response.ok) {
                setWorkers(workers.filter(worker => worker.id !== id));
                toast.success("Worker deleted successfully!");
            } else {
                toast.error("Failed to delete worker.");
            }
        } catch (error) {
            toast.error("Error deleting worker.");
            console.error("Error:", error);
        }
    };

    const styles = {
        container: {
            width: "80%",
            margin: "auto",
            textAlign: "center",
            padding: "20px",
            fontFamily: "Arial, sans-serif",
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
        },
        th: {
            backgroundColor: "#007bff",
            color: "white",
            padding: "10px",
        },
        td: {
            padding: "10px",
            borderBottom: "1px solid #ddd",
        },
        button: {
            padding: "8px 12px",
            margin: "5px",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
        },
        editButton: {
            backgroundColor: "#28a745",
            color: "white",
        },
        deleteButton: {
            backgroundColor: "#dc3545",
            color: "white",
        },
        backButton: {
            backgroundColor: "#6c757d",
            color: "white",
        },
    };

    return (
        <div style={styles.container}>
            <h1>Workers List</h1>
            <button 
                onClick={() => navigate("/dashboard")} 
                style={{ ...styles.button, ...styles.backButton }}
            >
                Back to Dashboard
            </button>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Employee ID</th>
                        <th style={styles.th}>Department</th>
                        <th style={styles.th}>Contact</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {workers.map(worker => (
                        <tr key={worker.id}>
                            <td style={styles.td}>{worker.name}</td>
                            <td style={styles.td}>{worker.employee_id}</td>
                            <td style={styles.td}>{worker.department}</td>
                            <td style={styles.td}>{worker.contact}</td>
                            <td style={styles.td}>
                                <button 
                                    onClick={() => navigate(`/edit-worker/${worker.id}`)}
                                    style={{ ...styles.button, ...styles.editButton }}
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(worker.id)}
                                    style={{ ...styles.button, ...styles.deleteButton }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
        </div>
    );
};

export default ViewWorkers;
