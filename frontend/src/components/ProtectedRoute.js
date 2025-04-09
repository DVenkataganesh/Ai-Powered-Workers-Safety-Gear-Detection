// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, roles, userRole, children }) => {
    if (!isAuthenticated || (roles && !roles.includes(userRole))) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
