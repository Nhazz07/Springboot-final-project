import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] text-[#1d1d1f] p-6">
        <div className="max-w-md w-full bg-white border border-black/8 rounded-3xl p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ff3b30]/10 border border-[#ff3b30]/20 flex items-center justify-center text-[#ff3b30] text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">Access Restricted</h2>
          <p className="text-[#86868b] text-sm mb-6">
            You do not have administrative privileges to view this section.
          </p>
          <a
            href="/products"
            className="inline-block px-6 py-2.5 bg-[#1d1d1f] hover:bg-[#333336] text-white text-sm font-semibold rounded-full transition shadow-md shadow-black/15"
          >
            Return to Products Catalog
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
