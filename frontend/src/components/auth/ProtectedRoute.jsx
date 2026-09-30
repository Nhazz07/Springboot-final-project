import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/landing" replace state={{ from: location }} />;
  }

  if (userOnly && isAdmin) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
