import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../utils/authStorage";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  }

  return <>{children}</>;
}
