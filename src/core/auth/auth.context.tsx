import React, { createContext, useContext, useMemo, useState } from "react";
import type { AuthUser, UserRole } from "./auth.types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginAs: (role: UserRole) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USERS: Record<UserRole, AuthUser> = {
  ADMIN: {
    id: "u_admin",
    nombre: "Admin Demo",
    email: "admin@virtualplanet.local",
    role: "ADMIN",
    tenantId: null,
  },
  PROFESOR: {
    id: "u_teacher",
    nombre: "Profesor Demo",
    email: "profesor@virtualplanet.local",
    role: "PROFESOR",
    tenantId: "t_school_1",
  },
  ESTUDIANTE: {
    id: "u_student",
    nombre: "Estudiante Demo",
    email: "estudiante@virtualplanet.local",
    role: "ESTUDIANTE",
    tenantId: "t_school_1",
  },
};

const LS_KEY = "vp_demo_role";

function readRoleFromStorage(): UserRole | null {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === "ADMIN" || v === "PROFESOR" || v === "ESTUDIANTE") return v;
    return null;
  } catch {
    return null;
  }
}

function writeRoleToStorage(role: UserRole | null) {
  try {
    if (!role) localStorage.removeItem(LS_KEY);
    else localStorage.setItem(LS_KEY, role);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialRole = readRoleFromStorage() ?? "ADMIN";
  const [user, setUser] = useState<AuthUser | null>(DEMO_USERS[initialRole]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isAuthenticated: !!user,
      loginAs: (role: UserRole) => {
        writeRoleToStorage(role);
        setUser(DEMO_USERS[role]);
      },
      logout: () => {
        writeRoleToStorage(null);
        setUser(null);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}