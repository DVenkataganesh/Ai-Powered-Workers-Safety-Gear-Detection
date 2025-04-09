import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setIsAuthenticated }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('worker');
    const [isRegister, setIsRegister] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages

        const endpoint = isRegister ? 'register' : 'login';
        const requestBody = isRegister ? { email, password, role } : { email, password };

        try {
            const response = await fetch(`http://localhost:7755/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (response.ok) {
                if (!isRegister) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.role);
                    setIsAuthenticated(true);

                    // Navigate based on role
                    if (data.role === 'admin') {
                        navigate('/admin-dashboard', { replace: true });
                    } else if (data.role === 'manager') {
                        navigate('/manager-dashboard', { replace: true });
                    } else {
                        navigate('/dashboard', { replace: true });
                    }
                } else {
                    setMessage('Registration successful! Please login.');
                    setIsRegister(false); // Switch to login mode
                }
            } else {
                setMessage(data.message || 'An error occurred. Please try again.');
            }
        } catch (error) {
            setMessage('Server error. Please try again later.');
        }
    };

    const styles = {
        container: {
            backgroundImage: `url('backgroundimage.jpg')`,
            backgroundSize: 'cover',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
        },
        box: {
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            width: '100%',
            maxWidth: '400px',
        },
        input: {
            width: '90%',
            padding: '10px',
            margin: '8px 0 15px 0',
            border: '1px solid #ccc',
            borderRadius: '6px',
            outline: 'none',
            boxSizing: 'border-box',
        },
        button: {
            width: '95%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px',
        },
        message: {
            color: 'red',
            marginTop: '10px',
            fontWeight: 'bold',
        },
        toggleText: {
            marginTop: '15px',
            color: '#007bff',
            cursor: 'pointer',
            textDecoration: 'underline',
        },
        label: {
            display: 'block',
            fontWeight: 'bold',
            marginTop: '10px',
        },
        select: {
            width: '93%',
            padding: '10px',
            margin: '8px 0 15px 0',
            border: '1px solid #ccc',
            borderRadius: '6px',
            outline: 'none',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.box}>
                <h2>{isRegister ? 'Register' : 'Login'}</h2>
                <form onSubmit={handleSubmit}>
                    <label style={styles.label}>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />

                    <label style={styles.label}>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />

                    {isRegister && (
                        <>
                            <label style={styles.label}>Role:</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={styles.select}
                            >
                                <option value="worker">Worker</option>
                                <option value="manager">Manager</option>
                                {/* <option value="admin">Admin</option> */}
                            </select>
                        </>
                    )}

                    <button type="submit" style={styles.button}>
                        {isRegister ? 'Register' : 'Login'}
                    </button>
                </form>

                {message && <p style={styles.message}>{message}</p>}

                <p
                    style={styles.toggleText}
                    onClick={() => setIsRegister(!isRegister)}
                >
                    {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
                </p>
            </div>
        </div>
    );
}

export default Login;
