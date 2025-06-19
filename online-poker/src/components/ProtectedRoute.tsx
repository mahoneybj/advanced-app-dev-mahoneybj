import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../context/FirebaseAuthContext";
import SplashScreen from "./pages/SplashScreen";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

// ProtectedRoute wapper checks if the user is authenticated, if not, redirects to the login page
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
