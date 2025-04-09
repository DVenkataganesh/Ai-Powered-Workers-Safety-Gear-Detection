import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WorkerRegistration = () => {
    const [worker, setWorker] = useState({
        name: "",
        employee_id: "",
        department: "",
        contact: "",
        assigned_area: "Machine Area"
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setWorker({ ...worker, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Get the JWT token from local storage
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:7755/api/workers/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Include the Authorization token
                },
                body: JSON.stringify(worker),
            });

            if (response.ok) {
                toast.success("Worker registered successfully!");
                setTimeout(() => navigate("/dashboard"), 2000); // Navigate to the dashboard after 2 sec
            } else if (response.status === 403) {
                toast.error("Access denied! You don't have the required permissions.");
            } else {
                toast.error("Failed to register worker. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong. Please check your connection.");
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Register Worker</h1>
            <form style={styles.form} onSubmit={handleSubmit}>
                <label style={styles.label}>Name:</label>
                <input 
                    style={styles.input} 
                    type="text" 
                    name="name" 
                    value={worker.name} 
                    onChange={handleChange} 
                    required 
                />

                <label style={styles.label}>Employee ID:</label>
                <input 
                    style={styles.input} 
                    type="text" 
                    name="employee_id" 
                    value={worker.employee_id} 
                    onChange={handleChange} 
                    required 
                />

                <label style={styles.label}>Department:</label>
                <input 
                    style={styles.input} 
                    type="text" 
                    name="department" 
                    value={worker.department} 
                    onChange={handleChange} 
                    required 
                />

                <label style={styles.label}>Contact:</label>
                <input 
                    style={styles.input} 
                    type="text" 
                    name="contact" 
                    value={worker.contact} 
                    onChange={handleChange} 
                    required 
                />

                <label style={styles.label}>Assigned Area:</label>
                <select 
                    style={styles.select} 
                    name="assigned_area" 
                    value={worker.assigned_area} 
                    onChange={handleChange}
                >
                    <option value="Machine Area">Machine Area</option>
                    <option value="Gate">Gate</option>
                </select>

                <button style={styles.button} type="submit">Register Worker</button>
                <button 
                    style={styles.secondaryButton} 
                    type="button" 
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>
            </form>

            {/* Toastify Notification Container */}
            <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "500px",
        margin: "50px auto",
        padding: "20px",
        background: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
    },
    heading: {
        color: "#333",
        marginBottom: "20px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    label: {
        fontWeight: "bold",
        marginBottom: "5px",
        width: "100%",
        textAlign: "left",
    },
    input: {
        padding: "10px",
        marginBottom: "15px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "16px",
        width: "100%",
    },
    select: {
        padding: "10px",
        marginBottom: "15px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "16px",
        width: "100%",
    },
    button: {
        backgroundColor: "#007bff",
        color: "white",
        padding: "10px",
        border: "none",
        borderRadius: "5px",
        fontSize: "16px",
        cursor: "pointer",
        transition: "background-color 0.3s",
        width: "100%",
        marginTop: "10px",
    },
    secondaryButton: {
        backgroundColor: "#6c757d",
        color: "white",
        padding: "10px",
        border: "none",
        borderRadius: "5px",
        fontSize: "16px",
        cursor: "pointer",
        transition: "background-color 0.3s",
        width: "100%",
        marginTop: "10px",
    }
};

export default WorkerRegistration;
