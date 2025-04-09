import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditWorker = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [worker, setWorker] = useState({
        name: "",
        employee_id: "",
        department: "",
        contact: "",
        assigned_area: ""
    });

    useEffect(() => {
        const fetchWorkerDetails = async () => {
            const token = localStorage.getItem("token"); // Get JWT token

            try {
                const response = await fetch(`http://localhost:7755/api/workers/${id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`, // Include authorization header
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setWorker(data);
                } else if (response.status === 403) {
                    toast.error("Access denied! You don't have the required permissions.");
                    navigate("/login"); // Redirect to login if unauthorized
                } else {
                    toast.error("Failed to fetch worker details.");
                }
            } catch (error) {
                toast.error("Error fetching worker details.");
                console.error("Error fetching worker:", error);
            }
        };

        if (id) fetchWorkerDetails();
    }, [id, navigate]);

    const handleChange = (e) => {
        setWorker({ ...worker, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token"); // Get JWT token

        try {
            const response = await fetch(`http://localhost:7755/api/workers/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Include authorization header
                },
                body: JSON.stringify(worker),
            });

            if (response.ok) {
                toast.success("Worker updated successfully!");
                setTimeout(() => navigate("/view-workers"), 2000); // Redirect after toast
            } else if (response.status === 403) {
                toast.error("Access denied! Unauthorized action.");
                navigate("/login");
            } else {
                toast.error("Failed to update worker.");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong.");
        }
    };

    const styles = {
        container: {
            width: "50%",
            margin: "auto",
            textAlign: "center",
            padding: "20px",
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.1)"
        },
        form: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        },
        label: {
            fontWeight: "bold",
            marginTop: "10px",
            marginBottom: "5px"
        },
        input: {
            width: "80%",
            padding: "8px",
            marginBottom: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
        },
        button: {
            padding: "10px 15px",
            margin: "10px",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
        },
        updateButton: {
            backgroundColor: "#28a745",
            color: "white",
        },
        cancelButton: {
            backgroundColor: "#dc3545",
            color: "white",
        }
    };

    return (
        <div style={styles.container}>
            <h1>Edit Worker</h1>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>Name:</label>
                <input 
                    type="text" 
                    name="name" 
                    value={worker.name} 
                    onChange={handleChange} 
                    required 
                    style={styles.input} 
                />

                <label style={styles.label}>Employee ID:</label>
                <input 
                    type="text" 
                    name="employee_id" 
                    value={worker.employee_id} 
                    onChange={handleChange} 
                    required 
                    style={styles.input} 
                />

                <label style={styles.label}>Department:</label>
                <input 
                    type="text" 
                    name="department" 
                    value={worker.department} 
                    onChange={handleChange} 
                    required 
                    style={styles.input} 
                />

                <label style={styles.label}>Contact:</label>
                <input 
                    type="text" 
                    name="contact" 
                    value={worker.contact} 
                    onChange={handleChange} 
                    required 
                    style={styles.input} 
                />

                <label style={styles.label}>Assigned Area:</label>
                <input 
                    type="text" 
                    name="assigned_area" 
                    value={worker.assigned_area} 
                    onChange={handleChange} 
                    required 
                    style={styles.input} 
                />

                <div>
                    <button type="submit" style={{ ...styles.button, ...styles.updateButton }}>Update Worker</button>
                    <button 
                        type="button" 
                        onClick={() => navigate("/view-workers")} 
                        style={{ ...styles.button, ...styles.cancelButton }}
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
        </div>
    );
};

export default EditWorker;
