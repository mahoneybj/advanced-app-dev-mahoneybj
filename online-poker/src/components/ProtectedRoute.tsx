import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../context/FirebaseAuthContext";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

// Checks if the user is authenticated, if not, redirects to the login page
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
