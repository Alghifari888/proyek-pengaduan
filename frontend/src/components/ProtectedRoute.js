import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // Jika tidak login, "lempar" ke halaman login
    return <Navigate to="/login" />;
  }

  // Jika sudah login, tampilkan halaman yang diminta (children)
  return children;
};

export default ProtectedRoute;