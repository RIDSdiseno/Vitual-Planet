import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import type { UserRole } from "./auth.types";

export default function RoleGuard({
  allow,
  children,
  redirectTo = "/",
}: {
  allow: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  if (!user || !allow.includes(user.role)) {
    return (
      <div className="p-6">
        <div className="text-lg font-semibold">No autorizado</div>
        <p className="mt-2 text-sm text-vp-muted">
          Tu rol no tiene permisos para acceder a esta vista.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
