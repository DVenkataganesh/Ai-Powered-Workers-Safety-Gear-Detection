// App.js
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Monitoring from './components/Monitoring';
import Violations from './components/Violations';
import WorkerRegistration from './components/WorkerRegistration';
import ViewWorkers from './components/ViewWorkers';
import EditWorker from './components/EditWorker';
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:7755/validate-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(true);
                    setUserRole(data.role);
                } else {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error validating token:', error);
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        };

        validateToken();
    }, []);

    return (
        <Routes>
            {/* Login Route */}
            <Route
                path="/"
                element={
                    isAuthenticated ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <Login setIsAuthenticated={setIsAuthenticated} />
                    )
                }
            />

            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} roles={['admin', 'manager', 'worker']} userRole={userRole}>
                        <Dashboard setIsAuthenticated={setIsAuthenticated} />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/monitoring"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} roles={['admin', 'manager', 'worker']} userRole={userRole}>
                        <Monitoring />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/violations"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} roles={['admin', 'manager']} userRole={userRole}>
                        <Violations />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/worker-registration"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} roles={['admin']} userRole={userRole}>
                        <WorkerRegistration />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/view-workers"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} roles={['admin', 'manager']} userRole={userRole}>
                        <ViewWorkers />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/edit-worker/:id"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} roles={['admin']} userRole={userRole}>
                        <EditWorker />
                    </ProtectedRoute>
                }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
