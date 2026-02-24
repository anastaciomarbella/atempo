import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setAuthenticated(true);
    }

    setChecking(false);
  }, []);

  if (checking) {
    return null; // o un loader si quieres
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}