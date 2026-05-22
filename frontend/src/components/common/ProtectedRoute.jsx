import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initAuth, isLoading: authLoading } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
