#!/usr/bin/env bash
set -e

# -----------------------------
# 1) Carpetas
# -----------------------------
mkdir -p src/{app,assets,layouts,core/auth,shared/{layout,ui},features/{admin/{components,pages},teacher/{components,pages},student/{components,pages}},services/{users,courses,tenants,billing}}

# -----------------------------
# 2) Archivos base
# -----------------------------
touch \
  src/app/{routes.ts,AppRouter.tsx} \
  src/layouts/{AdminLayout.tsx,TeacherLayout.tsx,StudentLayout.tsx} \
  src/core/auth/{auth.types.ts,auth.context.tsx,useAuth.ts,RoleGuard.tsx} \
  src/shared/layout/{AppShell.tsx,Sidebar.tsx,Topbar.tsx,PageHeader.tsx} \
  src/shared/ui/{Button.tsx,Card.tsx,Input.tsx,Select.tsx,Badge.tsx,Modal.tsx,Table.tsx} \
  src/features/admin/pages/{DashboardPage.tsx,UsersPage.tsx,TenantsPage.tsx,TenantDetailPage.tsx,BillingPage.tsx} \
  src/features/admin/components/{AdminSidebarNav.ts,AdminDashboardCards.tsx,UsersFilters.tsx,UsersTable.tsx,UsersModal.tsx} \
  src/features/admin/components/tenants/{TenantsFilters.tsx,TenantsTable.tsx,TenantKpis.tsx} \
  src/features/admin/components/billing/{BillingFilters.tsx,BillingTable.tsx} \
  src/features/teacher/pages/DashboardPage.tsx \
  src/features/teacher/components/{TeacherSidebarNav.ts,TeacherDashboardCards.tsx} \
  src/features/student/pages/DashboardPage.tsx \
  src/features/student/components/{StudentSidebarNav.ts,StudentDashboardCards.tsx} \
  src/services/users/{index.ts,users.types.ts,users.mock.ts,users.repo.ts,users.repo.mock.ts} \
  src/services/courses/{index.ts,courses.types.ts,courses.mock.ts,courses.repo.ts,courses.repo.mock.ts} \
  src/services/tenants/{index.ts,tenants.types.ts,tenants.mock.ts,tenants.repo.ts,tenants.repo.mock.ts} \
  src/services/billing/{index.ts,billing.types.ts,billing.mock.ts,billing.repo.ts,billing.repo.mock.ts}

# -----------------------------
# 3) App routes
# -----------------------------
cat > src/app/routes.ts <<'EOF'
export const ROUTES = {
  admin: "/admin",
  teacher: "/profesor",
  student: "/estudiante",
} as const;
EOF

cat > src/app/AppRouter.tsx <<'EOF'
import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "./routes";
import RoleGuard from "../core/auth/RoleGuard";

import AdminLayout from "../layouts/AdminLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import StudentLayout from "../layouts/StudentLayout";

import AdminDashboardPage from "../features/admin/pages/DashboardPage";
import UsersPage from "../features/admin/pages/UsersPage";
import TenantsPage from "../features/admin/pages/TenantsPage";
import TenantDetailPage from "../features/admin/pages/TenantDetailPage";
import BillingPage from "../features/admin/pages/BillingPage";

import TeacherDashboardPage from "../features/teacher/pages/DashboardPage";
import StudentDashboardPage from "../features/student/pages/DashboardPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.admin} replace />} />

      <Route
        path={ROUTES.admin}
        element={
          <RoleGuard allow={["ADMIN"]} redirectTo={ROUTES.admin}>
            <AdminLayout />
          </RoleGuard>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="tenants" element={<TenantsPage />} />
        <Route path="tenants/:tenantId" element={<TenantDetailPage />} />
        <Route path="cobranza" element={<BillingPage />} />
        <Route path="usuarios" element={<UsersPage />} />
      </Route>

      <Route
        path={ROUTES.teacher}
        element={
          <RoleGuard allow={["PROFESOR"]} redirectTo={ROUTES.teacher}>
            <TeacherLayout />
          </RoleGuard>
        }
      >
        <Route index element={<TeacherDashboardPage />} />
      </Route>

      <Route
        path={ROUTES.student}
        element={
          <RoleGuard allow={["ESTUDIANTE"]} redirectTo={ROUTES.student}>
            <StudentLayout />
          </RoleGuard>
        }
      >
        <Route index element={<StudentDashboardPage />} />
      </Route>

      <Route path="*" element={<div className="p-6">404</div>} />
    </Routes>
  );
}
EOF

# -----------------------------
# 4) Auth (igual que antes)
# -----------------------------
cat > src/core/auth/auth.types.ts <<'EOF'
export type UserRole = "ADMIN" | "PROFESOR" | "ESTUDIANTE";

export type AuthUser = {
  id: string;
  nombre: string;
  email?: string;
  role: UserRole;

  // multi-tenant: cuando sea Admin de colegio, esto sirve
  tenantId?: string | null;
};
EOF

cat > src/core/auth/auth.context.tsx <<'EOF'
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
  ADMIN: { id: "u_admin", nombre: "Admin Demo", email: "admin@virtualplanet.local", role: "ADMIN", tenantId: null },
  PROFESOR: { id: "u_teacher", nombre: "Profesor Demo", email: "profesor@virtualplanet.local", role: "PROFESOR", tenantId: "t_school_1" },
  ESTUDIANTE: { id: "u_student", nombre: "Estudiante Demo", email: "estudiante@virtualplanet.local", role: "ESTUDIANTE", tenantId: "t_school_1" },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEMO_USERS.ADMIN);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isAuthenticated: !!user,
      loginAs: (role: UserRole) => setUser(DEMO_USERS[role]),
      logout: () => setUser(null),
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
EOF

cat > src/core/auth/useAuth.ts <<'EOF'
export { useAuthContext as useAuth } from "./auth.context";
EOF

cat > src/core/auth/RoleGuard.tsx <<'EOF'
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
EOF

# -----------------------------
# 5) Layout (igual que antes)
# -----------------------------
cat > src/shared/layout/AppShell.tsx <<'EOF'
import { Outlet } from "react-router-dom";
import Sidebar, { type SidebarNavItem } from "./Sidebar";
import Topbar from "./Topbar";

type Props = {
  brand: { title: string; subtitle: string };
  nav: SidebarNavItem[];
};

export default function AppShell({ brand, nav }: Props) {
  return (
    <div className="min-h-screen bg-vp-bg text-vp-text">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <Sidebar brand={brand} nav={nav} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="flex-1 p-4 md:p-6">
            <div className="rounded-2xl border border-vp-border bg-vp-panel shadow-soft">
              <div className="p-4 md:p-6">
                <Outlet />
              </div>
            </div>
          </main>

          <footer className="px-6 pb-6 text-xs text-vp-muted">
            Virtual Planet • UI Mock v0.2 (multi-tenant)
          </footer>
        </div>
      </div>
    </div>
  );
}
EOF

cat > src/shared/layout/Sidebar.tsx <<'EOF'
import { NavLink } from "react-router-dom";

export type SidebarNavItem = {
  to: string;
  label: string;
};

function linkClass(isActive: boolean) {
  return [
    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
    "border border-transparent",
    isActive
      ? "bg-vp-bg/60 border-vp-border text-vp-text"
      : "text-vp-muted hover:text-vp-text hover:bg-vp-bg/40",
  ].join(" ");
}

export default function Sidebar({
  brand,
  nav,
}: {
  brand: { title: string; subtitle: string };
  nav: SidebarNavItem[];
}) {
  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-vp-border bg-vp-panel md:flex md:flex-col">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-vp-primary/15 border border-vp-border">
            <span className="text-vp-primary font-bold">VP</span>
          </div>
          <div className="leading-tight">
            <div className="font-semibold">{brand.title}</div>
            <div className="text-xs text-vp-muted">{brand.subtitle}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4">
        <div className="mb-3 text-xs font-semibold text-vp-muted tracking-wide">
          MENÚ
        </div>

        <div className="space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) => linkClass(isActive)}
            >
              <span className="h-2 w-2 rounded-full bg-vp-primary/70" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4">
        <div className="rounded-2xl border border-vp-border bg-vp-bg/30 p-3">
          <div className="text-sm font-medium">Estado</div>
          <div className="mt-1 text-xs text-vp-muted">Maqueta • sin APIs</div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-vp-bg/60">
            <div className="h-full w-[35%] bg-vp-primary" />
          </div>
        </div>
      </div>
    </aside>
  );
}
EOF

cat > src/shared/layout/Topbar.tsx <<'EOF'
import { ROUTES } from "../../app/routes";
import { useAuth } from "../../core/auth/useAuth";

export default function Topbar() {
  const { user, loginAs, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-vp-border bg-vp-bg/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div>
          <div className="text-sm text-vp-muted">Panel</div>
          <div className="text-lg font-semibold">Virtual Planet</div>
        </div>

        <div className="flex items-center gap-2">
          <a className="rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm hover:border-vp-primary" href={ROUTES.admin}>Admin</a>
          <a className="rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm hover:border-vp-primary" href={ROUTES.teacher}>Profesor</a>
          <a className="rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm hover:border-vp-primary" href={ROUTES.student}>Estudiante</a>

          <div className="ml-2 hidden md:block">
            <input
              className="w-[280px] rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm outline-none focus:border-vp-primary"
              placeholder="Buscar..."
            />
          </div>

          <div className="ml-2 flex items-center gap-2 rounded-xl border border-vp-border bg-vp-panel px-3 py-2">
            <div className="h-7 w-7 rounded-full bg-vp-primary/20 border border-vp-border" />
            <div className="text-sm leading-tight">
              <div className="font-medium">{user?.nombre ?? "Invitado"}</div>
              <div className="text-xs text-vp-muted">{user?.role ?? "—"}</div>
            </div>
          </div>

          <select
            className="ml-2 rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm outline-none focus:border-vp-primary"
            value={user?.role ?? "ADMIN"}
            onChange={(e) => loginAs(e.target.value as any)}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="PROFESOR">PROFESOR</option>
            <option value="ESTUDIANTE">ESTUDIANTE</option>
          </select>

          <button
            className="rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm hover:border-vp-primary"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
EOF

cat > src/shared/layout/PageHeader.tsx <<'EOF'
import React from "react";

export default function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-vp-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
EOF

cat > src/layouts/AdminLayout.tsx <<'EOF'
import AppShell from "../shared/layout/AppShell";
import { adminNav } from "../features/admin/components/AdminSidebarNav";

export default function AdminLayout() {
  return (
    <AppShell brand={{ title: "Virtual Planet", subtitle: "Admin (Multi-tenant)" }} nav={adminNav} />
  );
}
EOF

cat > src/layouts/TeacherLayout.tsx <<'EOF'
import AppShell from "../shared/layout/AppShell";
import { teacherNav } from "../features/teacher/components/TeacherSidebarNav";

export default function TeacherLayout() {
  return (
    <AppShell brand={{ title: "Virtual Planet", subtitle: "Profesor" }} nav={teacherNav} />
  );
}
EOF

cat > src/layouts/StudentLayout.tsx <<'EOF'
import AppShell from "../shared/layout/AppShell";
import { studentNav } from "../features/student/components/StudentSidebarNav";

export default function StudentLayout() {
  return (
    <AppShell brand={{ title: "Virtual Planet", subtitle: "Estudiante" }} nav={studentNav} />
  );
}
EOF

# -----------------------------
# 6) Admin nav actualizado (multi-tenant)
# -----------------------------
cat > src/features/admin/components/AdminSidebarNav.ts <<'EOF'
import type { SidebarNavItem } from "../../../shared/layout/Sidebar";

export const adminNav: SidebarNavItem[] = [
  { to: "/admin", label: "Resumen" },
  { to: "/admin/tenants", label: "Colegios / Tenants" },
  { to: "/admin/cobranza", label: "Cobranza" },
  { to: "/admin/usuarios", label: "Usuarios" },
];
EOF

# -----------------------------
# 7) Tenants microservice (mock)
# -----------------------------
cat > src/services/tenants/tenants.types.ts <<'EOF'
export type TenantType = "SCHOOL" | "SOLO_TEACHER";
export type TenantStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED";
export type Plan = "BASIC" | "PRO" | "ENTERPRISE";

export type Tenant = {
  id: string;
  type: TenantType;
  name: string;
  city?: string;
  country?: string;

  status: TenantStatus;
  plan: Plan;

  ownerName: string;
  ownerEmail: string;

  metrics: {
    students: number;
    teachers: number;
    courses: number;
  };

  billing: {
    currency: "CLP" | "USD";
    mrr: number; // mensual
    nextInvoiceDate: string; // YYYY-MM-DD
  };

  createdAt: string; // YYYY-MM-DD
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
EOF

cat > src/services/tenants/tenants.mock.ts <<'EOF'
import type { Tenant } from "./tenants.types";

export const TENANTS_MOCK: Tenant[] = [
  {
    id: "t_school_1",
    type: "SCHOOL",
    name: "Colegio San Martín",
    city: "Santiago",
    country: "Chile",
    status: "ACTIVE",
    plan: "PRO",
    ownerName: "María Soto",
    ownerEmail: "maria@sanmartin.cl",
    metrics: { students: 620, teachers: 38, courses: 54 },
    billing: { currency: "CLP", mrr: 189000, nextInvoiceDate: "2026-03-05" },
    createdAt: "2026-01-20",
  },
  {
    id: "t_school_2",
    type: "SCHOOL",
    name: "Liceo Norte",
    city: "Valparaíso",
    country: "Chile",
    status: "PAST_DUE",
    plan: "BASIC",
    ownerName: "Javier Rojas",
    ownerEmail: "jrojas@liceonorte.cl",
    metrics: { students: 410, teachers: 22, courses: 31 },
    billing: { currency: "CLP", mrr: 99000, nextInvoiceDate: "2026-02-15" },
    createdAt: "2026-02-02",
  },
  {
    id: "t_solo_1",
    type: "SOLO_TEACHER",
    name: "Profesor Particular - Camila Díaz",
    city: "Concepción",
    country: "Chile",
    status: "TRIAL",
    plan: "BASIC",
    ownerName: "Camila Díaz",
    ownerEmail: "camila@gmail.com",
    metrics: { students: 18, teachers: 1, courses: 3 },
    billing: { currency: "CLP", mrr: 19900, nextInvoiceDate: "2026-03-01" },
    createdAt: "2026-02-24",
  },
  {
    id: "t_school_3",
    type: "SCHOOL",
    name: "Colegio Santa Ana",
    city: "La Serena",
    country: "Chile",
    status: "SUSPENDED",
    plan: "PRO",
    ownerName: "Paula Arancibia",
    ownerEmail: "paula@santaana.cl",
    metrics: { students: 780, teachers: 44, courses: 60 },
    billing: { currency: "CLP", mrr: 189000, nextInvoiceDate: "2026-02-10" },
    createdAt: "2025-12-10",
  },
];
EOF

cat > src/services/tenants/tenants.repo.ts <<'EOF'
import type { Paginated, Plan, Tenant, TenantStatus, TenantType } from "./tenants.types";

export type ListTenantsParams = {
  query?: string;
  type?: TenantType | "";
  status?: TenantStatus | "";
  plan?: Plan | "";
  page?: number;
  pageSize?: number;
};

export interface TenantsRepo {
  list(params: ListTenantsParams): Promise<Paginated<Tenant>>;
  getById(id: string): Promise<Tenant | null>;
}
EOF

cat > src/services/tenants/tenants.repo.mock.ts <<'EOF'
import type { TenantsRepo } from "./tenants.repo";
import type { Paginated, Tenant } from "./tenants.types";
import { TENANTS_MOCK } from "./tenants.mock";

function includes(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.toLowerCase());
}

export const tenantsRepoMock: TenantsRepo = {
  async list(params) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const q = (params.query ?? "").trim();
    const type = params.type ?? "";
    const status = params.status ?? "";
    const plan = params.plan ?? "";

    let rows = [...TENANTS_MOCK];

    if (type) rows = rows.filter((t) => t.type === type);
    if (status) rows = rows.filter((t) => t.status === status);
    if (plan) rows = rows.filter((t) => t.plan === plan);

    if (q) {
      rows = rows.filter(
        (t) =>
          includes(t.name, q) ||
          includes(t.ownerName, q) ||
          includes(t.ownerEmail, q)
      );
    }

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize);

    await new Promise((r) => setTimeout(r, 250));

    const resp: Paginated<Tenant> = { items, page, pageSize, total };
    return resp;
  },

  async getById(id) {
    await new Promise((r) => setTimeout(r, 150));
    return TENANTS_MOCK.find((t) => t.id === id) ?? null;
  },
};
EOF

cat > src/services/tenants/index.ts <<'EOF'
export * from "./tenants.types";
export * from "./tenants.repo";
export { tenantsRepoMock } from "./tenants.repo.mock";
EOF

# -----------------------------
# 8) Billing microservice (mock)
# -----------------------------
cat > src/services/billing/billing.types.ts <<'EOF'
export type InvoiceStatus = "PAID" | "PENDING" | "OVERDUE";

export type Invoice = {
  id: string;
  tenantId: string;
  tenantName: string;

  amount: number;
  currency: "CLP" | "USD";

  period: string; // "2026-02"
  dueDate: string; // YYYY-MM-DD
  status: InvoiceStatus;
  paidAt?: string | null;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
EOF

cat > src/services/billing/billing.mock.ts <<'EOF'
import type { Invoice } from "./billing.types";

export const INVOICES_MOCK: Invoice[] = [
  { id: "inv_1", tenantId: "t_school_2", tenantName: "Liceo Norte", amount: 99000, currency: "CLP", period: "2026-02", dueDate: "2026-02-15", status: "OVERDUE", paidAt: null },
  { id: "inv_2", tenantId: "t_school_1", tenantName: "Colegio San Martín", amount: 189000, currency: "CLP", period: "2026-02", dueDate: "2026-02-05", status: "PAID", paidAt: "2026-02-03" },
  { id: "inv_3", tenantId: "t_solo_1", tenantName: "Profesor Particular - Camila Díaz", amount: 19900, currency: "CLP", period: "2026-02", dueDate: "2026-03-01", status: "PENDING", paidAt: null },
  { id: "inv_4", tenantId: "t_school_3", tenantName: "Colegio Santa Ana", amount: 189000, currency: "CLP", period: "2026-02", dueDate: "2026-02-10", status: "OVERDUE", paidAt: null },
];
EOF

cat > src/services/billing/billing.repo.ts <<'EOF'
import type { Invoice, InvoiceStatus, Paginated } from "./billing.types";

export type ListInvoicesParams = {
  query?: string;
  status?: InvoiceStatus | "";
  page?: number;
  pageSize?: number;
};

export interface BillingRepo {
  list(params: ListInvoicesParams): Promise<Paginated<Invoice>>;
}
EOF

cat > src/services/billing/billing.repo.mock.ts <<'EOF'
import type { BillingRepo } from "./billing.repo";
import type { Invoice, Paginated } from "./billing.types";
import { INVOICES_MOCK } from "./billing.mock";

function includes(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.toLowerCase());
}

export const billingRepoMock: BillingRepo = {
  async list(params) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const q = (params.query ?? "").trim();
    const status = params.status ?? "";

    let rows = [...INVOICES_MOCK];

    if (status) rows = rows.filter((i) => i.status === status);

    if (q) {
      rows = rows.filter(
        (i) => includes(i.tenantName, q) || includes(i.id, q)
      );
    }

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize);

    await new Promise((r) => setTimeout(r, 250));

    const resp: Paginated<Invoice> = { items, page, pageSize, total };
    return resp;
  },
};
EOF

cat > src/services/billing/index.ts <<'EOF'
export * from "./billing.types";
export * from "./billing.repo";
export { billingRepoMock } from "./billing.repo.mock";
EOF

# -----------------------------
# 9) Admin pages (multi-tenant)
# -----------------------------
cat > src/features/admin/pages/DashboardPage.tsx <<'EOF'
import PageHeader from "../../../shared/layout/PageHeader";
import AdminDashboardCards from "../components/AdminDashboardCards";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumen"
        subtitle="Vista global multi-tenant (colegios y profesores particulares)."
        right={
          <button className="rounded-xl bg-vp-primary px-4 py-2 text-sm font-medium text-white hover:bg-vp-primary2">
            Exportar
          </button>
        }
      />
      <AdminDashboardCards />
    </div>
  );
}
EOF

cat > src/features/admin/components/AdminDashboardCards.tsx <<'EOF'
import { TENANTS_MOCK } from "../../../services/tenants/tenants.mock";
import { INVOICES_MOCK } from "../../../services/billing/billing.mock";

function moneyCLP(n: number) {
  try {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n);
  } catch {
    return String(n);
  }
}

export default function AdminDashboardCards() {
  const tenants = TENANTS_MOCK;
  const invoices = INVOICES_MOCK;

  const active = tenants.filter((t) => t.status === "ACTIVE").length;
  const trial = tenants.filter((t) => t.status === "TRIAL").length;
  const pastDue = tenants.filter((t) => t.status === "PAST_DUE").length;
  const suspended = tenants.filter((t) => t.status === "SUSPENDED").length;

  const overdue = invoices.filter((i) => i.status === "OVERDUE").length;
  const pending = invoices.filter((i) => i.status === "PENDING").length;

  const mrr = tenants.reduce((acc, t) => acc + (t.status === "ACTIVE" ? t.billing.mrr : 0), 0);

  const cards = [
    { t: "Tenants activos", v: String(active), s: `Trial: ${trial} • Suspendidos: ${suspended}` },
    { t: "Pagos vencidos", v: String(overdue), s: `Pendientes: ${pending}` },
    { t: "Tenants con deuda", v: String(pastDue), s: "Revisar cobranza" },
    { t: "MRR (mock)", v: moneyCLP(mrr), s: "Solo activos" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((k) => (
        <div key={k.t} className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm text-vp-muted">{k.t}</div>
          <div className="mt-2 text-2xl font-semibold">{k.v}</div>
          <div className="mt-2 text-xs text-vp-muted">{k.s}</div>
        </div>
      ))}
    </div>
  );
}
EOF

cat > src/features/admin/pages/TenantsPage.tsx <<'EOF'
import { useEffect, useState } from "react";
import PageHeader from "../../../shared/layout/PageHeader";
import TenantsFilters from "../components/tenants/TenantsFilters";
import TenantsTable from "../components/tenants/TenantsTable";
import { tenantsRepoMock, type Plan, type Tenant, type TenantStatus, type TenantType } from "../../../services/tenants";

export default function TenantsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TenantType | "">("");
  const [status, setStatus] = useState<TenantStatus | "">("");
  const [plan, setPlan] = useState<Plan | "">("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<Tenant[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    tenantsRepoMock
      .list({ query, type, status, plan, page, pageSize: 10 })
      .then((res) => {
        if (!alive) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [query, type, status, plan, page]);

  return (
    <div className="space-y-6">
      <PageHeader title="Colegios / Tenants" subtitle="Lista de tenants inscritos (colegios y particulares)." />

      <TenantsFilters
        query={query}
        type={type}
        status={status}
        plan={plan}
        onChangeQuery={(v) => { setPage(1); setQuery(v); }}
        onChangeType={(v) => { setPage(1); setType(v); }}
        onChangeStatus={(v) => { setPage(1); setStatus(v); }}
        onChangePlan={(v) => { setPage(1); setPlan(v); }}
        total={total}
        loading={loading}
      />

      <TenantsTable items={items} loading={loading} />

      <div className="flex items-center justify-end gap-2">
        <button
          className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Anterior
        </button>
        <button
          className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm disabled:opacity-50"
          disabled={items.length < 10}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
EOF

cat > src/features/admin/components/tenants/TenantsFilters.tsx <<'EOF'
import type { Plan, TenantStatus, TenantType } from "../../../../services/tenants";

export default function TenantsFilters({
  query, type, status, plan,
  onChangeQuery, onChangeType, onChangeStatus, onChangePlan,
  total, loading,
}: {
  query: string;
  type: TenantType | "";
  status: TenantStatus | "";
  plan: Plan | "";
  onChangeQuery: (v: string) => void;
  onChangeType: (v: TenantType | "") => void;
  onChangeStatus: (v: TenantStatus | "") => void;
  onChangePlan: (v: Plan | "") => void;
  total: number;
  loading: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      <input
        className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        placeholder="Buscar tenant / dueño / email..."
        value={query}
        onChange={(e) => onChangeQuery(e.target.value)}
      />

      <select className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        value={type} onChange={(e) => onChangeType(e.target.value as any)}>
        <option value="">Tipo</option>
        <option value="SCHOOL">Colegio</option>
        <option value="SOLO_TEACHER">Particular</option>
      </select>

      <select className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        value={status} onChange={(e) => onChangeStatus(e.target.value as any)}>
        <option value="">Estado</option>
        <option value="ACTIVE">Activo</option>
        <option value="TRIAL">Trial</option>
        <option value="PAST_DUE">Con deuda</option>
        <option value="SUSPENDED">Suspendido</option>
      </select>

      <select className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        value={plan} onChange={(e) => onChangePlan(e.target.value as any)}>
        <option value="">Plan</option>
        <option value="BASIC">Basic</option>
        <option value="PRO">Pro</option>
        <option value="ENTERPRISE">Enterprise</option>
      </select>

      <div className="text-sm text-vp-muted flex items-center">
        {loading ? "Cargando..." : `${total} tenants`}
      </div>
    </div>
  );
}
EOF

cat > src/features/admin/components/tenants/TenantsTable.tsx <<'EOF'
import { Link } from "react-router-dom";
import type { Tenant } from "../../../../services/tenants";

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-vp-border bg-vp-bg/30 px-2 py-0.5 text-xs">
      {text}
    </span>
  );
}

function moneyCLP(n: number) {
  try {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n);
  } catch {
    return String(n);
  }
}

export default function TenantsTable({ items, loading }: { items: Tenant[]; loading: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-vp-border">
      <table className="w-full text-sm">
        <thead className="bg-vp-bg/50 text-vp-muted">
          <tr>
            <th className="px-4 py-3 text-left">Tenant</th>
            <th className="px-4 py-3 text-left">Tipo</th>
            <th className="px-4 py-3 text-left">Plan</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">MRR</th>
            <th className="px-4 py-3 text-left">Renovación</th>
          </tr>
        </thead>
        <tbody className="bg-vp-panel">
          {loading ? (
            <tr><td colSpan={6} className="px-4 py-6 text-vp-muted">Cargando...</td></tr>
          ) : items.length === 0 ? (
            <tr><td colSpan={6} className="px-4 py-6 text-vp-muted">Sin resultados.</td></tr>
          ) : (
            items.map((t) => (
              <tr key={t.id} className="border-t border-vp-border">
                <td className="px-4 py-3">
                  <Link className="hover:underline" to={`/admin/tenants/${t.id}`}>
                    {t.name}
                  </Link>
                  <div className="text-xs text-vp-muted">{t.ownerName} • {t.ownerEmail}</div>
                </td>
                <td className="px-4 py-3"><Badge text={t.type === "SCHOOL" ? "COLEGIO" : "PARTICULAR"} /></td>
                <td className="px-4 py-3"><Badge text={t.plan} /></td>
                <td className="px-4 py-3"><Badge text={t.status} /></td>
                <td className="px-4 py-3">{moneyCLP(t.billing.mrr)}</td>
                <td className="px-4 py-3">{t.billing.nextInvoiceDate}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
EOF

cat > src/features/admin/pages/TenantDetailPage.tsx <<'EOF'
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../shared/layout/PageHeader";
import { tenantsRepoMock, type Tenant } from "../../../services/tenants";
import { INVOICES_MOCK } from "../../../services/billing/billing.mock";

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-vp-border bg-vp-bg/30 px-2 py-0.5 text-xs">
      {text}
    </span>
  );
}

export default function TenantDetailPage() {
  const { tenantId } = useParams();
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    let alive = true;
    setLoading(true);
    tenantsRepoMock.getById(tenantId)
      .then((t) => alive && setTenant(t))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [tenantId]);

  const invoices = useMemo(() => {
    if (!tenant) return [];
    return INVOICES_MOCK.filter((i) => i.tenantId === tenant.id);
  }, [tenant]);

  if (loading) return <div className="text-sm text-vp-muted">Cargando...</div>;
  if (!tenant) return <div className="text-sm text-vp-muted">Tenant no encontrado.</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={tenant.name}
        subtitle={`${tenant.type === "SCHOOL" ? "Colegio" : "Particular"} • ${tenant.city ?? ""} ${tenant.country ?? ""}`}
        right={
          <Link className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary" to="/admin/tenants">
            Volver
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm text-vp-muted">Estado</div>
          <div className="mt-2 text-lg font-semibold"><Badge text={tenant.status} /></div>
          <div className="mt-2 text-xs text-vp-muted">Plan: {tenant.plan}</div>
        </div>

        <div className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm text-vp-muted">Contacto</div>
          <div className="mt-2 text-sm font-semibold">{tenant.ownerName}</div>
          <div className="text-xs text-vp-muted">{tenant.ownerEmail}</div>
        </div>

        <div className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm text-vp-muted">Métricas</div>
          <div className="mt-2 text-sm">Estudiantes: <b>{tenant.metrics.students}</b></div>
          <div className="text-sm">Profesores: <b>{tenant.metrics.teachers}</b></div>
          <div className="text-sm">Cursos: <b>{tenant.metrics.courses}</b></div>
        </div>
      </div>

      <div className="rounded-2xl border border-vp-border overflow-hidden">
        <div className="bg-vp-bg/50 px-4 py-3 text-sm font-semibold">Cobranza</div>
        <div className="bg-vp-panel">
          {invoices.length === 0 ? (
            <div className="px-4 py-4 text-sm text-vp-muted">Sin facturas (mock).</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-vp-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Factura</th>
                  <th className="px-4 py-3 text-left">Período</th>
                  <th className="px-4 py-3 text-left">Vence</th>
                  <th className="px-4 py-3 text-left">Monto</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="border-t border-vp-border">
                    <td className="px-4 py-3">{i.id}</td>
                    <td className="px-4 py-3">{i.period}</td>
                    <td className="px-4 py-3">{i.dueDate}</td>
                    <td className="px-4 py-3">{i.amount} {i.currency}</td>
                    <td className="px-4 py-3"><Badge text={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
EOF

cat > src/features/admin/pages/BillingPage.tsx <<'EOF'
import { useEffect, useState } from "react";
import PageHeader from "../../../shared/layout/PageHeader";
import BillingFilters from "../components/billing/BillingFilters";
import BillingTable from "../components/billing/BillingTable";
import { billingRepoMock, type Invoice, type InvoiceStatus } from "../../../services/billing";

export default function BillingPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<Invoice[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    billingRepoMock
      .list({ query, status, page, pageSize: 10 })
      .then((res) => {
        if (!alive) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [query, status, page]);

  return (
    <div className="space-y-6">
      <PageHeader title="Cobranza" subtitle="Pagos pendientes, vencidos y pagados (mock)." />

      <BillingFilters
        query={query}
        status={status}
        onChangeQuery={(v) => { setPage(1); setQuery(v); }}
        onChangeStatus={(v) => { setPage(1); setStatus(v); }}
        total={total}
        loading={loading}
      />

      <BillingTable items={items} loading={loading} />

      <div className="flex items-center justify-end gap-2">
        <button className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm disabled:opacity-50"
          disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Anterior
        </button>
        <button className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm disabled:opacity-50"
          disabled={items.length < 10} onClick={() => setPage((p) => p + 1)}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
EOF

cat > src/features/admin/components/billing/BillingFilters.tsx <<'EOF'
import type { InvoiceStatus } from "../../../../services/billing";

export default function BillingFilters({
  query,
  status,
  onChangeQuery,
  onChangeStatus,
  total,
  loading,
}: {
  query: string;
  status: InvoiceStatus | "";
  onChangeQuery: (v: string) => void;
  onChangeStatus: (v: InvoiceStatus | "") => void;
  total: number;
  loading: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <input
        className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        placeholder="Buscar tenant o factura..."
        value={query}
        onChange={(e) => onChangeQuery(e.target.value)}
      />

      <select
        className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        value={status}
        onChange={(e) => onChangeStatus(e.target.value as any)}
      >
        <option value="">Todos</option>
        <option value="PENDING">Pendiente</option>
        <option value="OVERDUE">Vencido</option>
        <option value="PAID">Pagado</option>
      </select>

      <div className="text-sm text-vp-muted flex items-center">
        {loading ? "Cargando..." : `${total} facturas`}
      </div>
    </div>
  );
}
EOF

cat > src/features/admin/components/billing/BillingTable.tsx <<'EOF'
import { Link } from "react-router-dom";
import type { Invoice } from "../../../../services/billing";

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-vp-border bg-vp-bg/30 px-2 py-0.5 text-xs">
      {text}
    </span>
  );
}

function moneyCLP(n: number) {
  try {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n);
  } catch {
    return String(n);
  }
}

export default function BillingTable({ items, loading }: { items: Invoice[]; loading: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-vp-border">
      <table className="w-full text-sm">
        <thead className="bg-vp-bg/50 text-vp-muted">
          <tr>
            <th className="px-4 py-3 text-left">Tenant</th>
            <th className="px-4 py-3 text-left">Factura</th>
            <th className="px-4 py-3 text-left">Período</th>
            <th className="px-4 py-3 text-left">Vence</th>
            <th className="px-4 py-3 text-left">Monto</th>
            <th className="px-4 py-3 text-left">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-vp-panel">
          {loading ? (
            <tr><td colSpan={6} className="px-4 py-6 text-vp-muted">Cargando...</td></tr>
          ) : items.length === 0 ? (
            <tr><td colSpan={6} className="px-4 py-6 text-vp-muted">Sin resultados.</td></tr>
          ) : (
            items.map((i) => (
              <tr key={i.id} className="border-t border-vp-border">
                <td className="px-4 py-3">
                  <Link className="hover:underline" to={`/admin/tenants/${i.tenantId}`}>
                    {i.tenantName}
                  </Link>
                </td>
                <td className="px-4 py-3">{i.id}</td>
                <td className="px-4 py-3">{i.period}</td>
                <td className="px-4 py-3">{i.dueDate}</td>
                <td className="px-4 py-3">{moneyCLP(i.amount)}</td>
                <td className="px-4 py-3"><Badge text={i.status} /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
EOF

# -----------------------------
# 10) Users & Courses (de tu script original, sin cambios)
# -----------------------------
cat > src/services/users/users.types.ts <<'EOF'
export type Role = "ADMIN" | "PROFESOR" | "ESTUDIANTE";
export type UserStatus = "ACTIVO" | "BLOQUEADO";

export type User = {
  id: string;
  nombre: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
EOF

cat > src/services/users/users.mock.ts <<'EOF'
import type { User } from "./users.types";

export const USERS_MOCK: User[] = [
  { id: "u1", nombre: "Carlos Molina", email: "carlos@virtualplanet.co", role: "ADMIN", status: "ACTIVO", createdAt: "2026-02-10" },
  { id: "u2", nombre: "Constanza Arenas", email: "constanza@rids.cl", role: "PROFESOR", status: "ACTIVO", createdAt: "2026-02-12" },
  { id: "u3", nombre: "Ignacio Gonzalez", email: "ignacio@rids.cl", role: "ADMIN", status: "ACTIVO", createdAt: "2026-02-12" },
  { id: "u4", nombre: "Andrea Pérez", email: "andrea@colegio.co", role: "ESTUDIANTE", status: "BLOQUEADO", createdAt: "2026-02-15" },
  { id: "u5", nombre: "Juan Torres", email: "juan@colegio.co", role: "ESTUDIANTE", status: "ACTIVO", createdAt: "2026-02-15" },
];
EOF

cat > src/services/users/users.repo.ts <<'EOF'
import type { Paginated, Role, User } from "./users.types";

export type ListUsersParams = {
  query?: string;
  role?: Role | "";
  page?: number;
  pageSize?: number;
};

export interface UsersRepo {
  list(params: ListUsersParams): Promise<Paginated<User>>;
}
EOF

cat > src/services/users/users.repo.mock.ts <<'EOF'
import type { UsersRepo } from "./users.repo";
import type { Paginated, User } from "./users.types";
import { USERS_MOCK } from "./users.mock";

function includes(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.toLowerCase());
}

export const usersRepoMock: UsersRepo = {
  async list(params) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const q = (params.query ?? "").trim();
    const role = params.role ?? "";

    let rows = [...USERS_MOCK];

    if (role) rows = rows.filter((u) => u.role === role);

    if (q) {
      rows = rows.filter((u) => includes(u.nombre, q) || includes(u.email, q));
    }

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize);

    await new Promise((r) => setTimeout(r, 250));

    const resp: Paginated<User> = { items, page, pageSize, total };
    return resp;
  },
};
EOF

cat > src/services/users/index.ts <<'EOF'
export * from "./users.types";
export * from "./users.repo";
export { usersRepoMock } from "./users.repo.mock";
EOF

cat > src/features/admin/pages/UsersPage.tsx <<'EOF'
import { useEffect, useState } from "react";
import PageHeader from "../../../shared/layout/PageHeader";
import UsersFilters from "../components/UsersFilters";
import UsersTable from "../components/UsersTable";
import UsersModal from "../components/UsersModal";
import { usersRepoMock, type Role, type User } from "../../../services/users";

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<User[]>([]);

  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    usersRepoMock
      .list({ query, role, page, pageSize: 10 })
      .then((res) => {
        if (!alive) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [query, role, page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        subtitle="Administración de usuarios y roles."
        right={
          <button
            className="rounded-xl bg-vp-primary px-4 py-2 text-sm font-medium text-white hover:bg-vp-primary2"
            onClick={() => setOpenCreate(true)}
          >
            Crear usuario
          </button>
        }
      />

      <UsersFilters
        query={query}
        role={role}
        onChangeQuery={(v) => {
          setPage(1);
          setQuery(v);
        }}
        onChangeRole={(v) => {
          setPage(1);
          setRole(v);
        }}
        total={total}
        loading={loading}
      />

      <UsersTable items={items} loading={loading} />

      <div className="flex items-center justify-end gap-2">
        <button
          className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Anterior
        </button>
        <button
          className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm disabled:opacity-50"
          disabled={items.length < 10}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>

      <UsersModal open={openCreate} onClose={() => setOpenCreate(false)} />
    </div>
  );
}
EOF

cat > src/features/admin/components/UsersFilters.tsx <<'EOF'
import type { Role } from "../../../services/users";

export default function UsersFilters({
  query,
  role,
  onChangeQuery,
  onChangeRole,
  total,
  loading,
}: {
  query: string;
  role: Role | "";
  onChangeQuery: (v: string) => void;
  onChangeRole: (v: Role | "") => void;
  total: number;
  loading: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <input
        className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        placeholder="Buscar por nombre o email..."
        value={query}
        onChange={(e) => onChangeQuery(e.target.value)}
      />

      <select
        className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        value={role}
        onChange={(e) => onChangeRole(e.target.value as Role | "")}
      >
        <option value="">Todos los roles</option>
        <option value="ADMIN">Admin</option>
        <option value="PROFESOR">Profesor</option>
        <option value="ESTUDIANTE">Estudiante</option>
      </select>

      <div className="text-sm text-vp-muted flex items-center">
        {loading ? "Cargando..." : `${total} usuarios`}
      </div>
    </div>
  );
}
EOF

cat > src/features/admin/components/UsersTable.tsx <<'EOF'
import type { User } from "../../../services/users";

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-vp-border bg-vp-bg/30 px-2 py-0.5 text-xs">
      {text}
    </span>
  );
}

export default function UsersTable({
  items,
  loading,
}: {
  items: User[];
  loading: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-vp-border">
      <table className="w-full text-sm">
        <thead className="bg-vp-bg/50 text-vp-muted">
          <tr>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Rol</th>
            <th className="px-4 py-3 text-left">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-vp-panel">
          {loading ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-vp-muted">
                Cargando...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-vp-muted">
                Sin resultados.
              </td>
            </tr>
          ) : (
            items.map((u) => (
              <tr key={u.id} className="border-t border-vp-border">
                <td className="px-4 py-3">{u.nombre}</td>
                <td className="px-4 py-3 text-vp-muted">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge text={u.role} />
                </td>
                <td className="px-4 py-3">
                  <Badge text={u.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
EOF

cat > src/features/admin/components/UsersModal.tsx <<'EOF'
export default function UsersModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-vp-border bg-vp-panel shadow-soft">
        <div className="flex items-center justify-between border-b border-vp-border p-4">
          <div className="text-sm font-semibold">Crear usuario (maqueta)</div>
          <button
            className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-1.5 text-sm hover:border-vp-primary"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input className="w-full rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary" placeholder="Nombre" />
          <input className="w-full rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary" placeholder="Email" />
          <select className="w-full rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary">
            <option value="ADMIN">Admin</option>
            <option value="PROFESOR">Profesor</option>
            <option value="ESTUDIANTE">Estudiante</option>
          </select>

          <div className="pt-2 flex justify-end gap-2">
            <button className="rounded-xl border border-vp-border bg-vp-bg/30 px-4 py-2 text-sm hover:border-vp-primary" onClick={onClose}>
              Cancelar
            </button>
            <button className="rounded-xl bg-vp-primary px-4 py-2 text-sm font-medium text-white hover:bg-vp-primary2" onClick={onClose}>
              Guardar
            </button>
          </div>

          <p className="text-xs text-vp-muted">
            Nota: este modal es solo UI. Después se conecta al users-service.
          </p>
        </div>
      </div>
    </div>
  );
}
EOF

cat > src/services/courses/courses.types.ts <<'EOF'
export type CourseStatus = "BORRADOR" | "PUBLICADO" | "ARCHIVADO";

export type Course = {
  id: string;
  titulo: string;
  status: CourseStatus;
  updatedAt: string;
};
EOF

cat > src/services/courses/courses.mock.ts <<'EOF'
import type { Course } from "./courses.types";

export const COURSES_MOCK: Course[] = [
  { id: "c1", titulo: "Matemáticas 6°", status: "PUBLICADO", updatedAt: "2026-02-20" },
  { id: "c2", titulo: "Física 10°", status: "BORRADOR", updatedAt: "2026-02-22" },
];
EOF

cat > src/services/courses/courses.repo.ts <<'EOF'
import type { Course } from "./courses.types";

export interface CoursesRepo {
  list(): Promise<Course[]>;
}
EOF

cat > src/services/courses/courses.repo.mock.ts <<'EOF'
import type { CoursesRepo } from "./courses.repo";
import type { Course } from "./courses.types";
import { COURSES_MOCK } from "./courses.mock";

export const coursesRepoMock: CoursesRepo = {
  async list() {
    await new Promise((r) => setTimeout(r, 250));
    return [...COURSES_MOCK] as Course[];
  },
};
EOF

cat > src/services/courses/index.ts <<'EOF'
export * from "./courses.types";
export * from "./courses.repo";
export { coursesRepoMock } from "./courses.repo.mock";
EOF

# Teacher/student nav + cards (igual)
cat > src/features/teacher/components/TeacherSidebarNav.ts <<'EOF'
import type { SidebarNavItem } from "../../../shared/layout/Sidebar";
export const teacherNav: SidebarNavItem[] = [{ to: "/profesor", label: "Dashboard" }];
EOF

cat > src/features/student/components/StudentSidebarNav.ts <<'EOF'
import type { SidebarNavItem } from "../../../shared/layout/Sidebar";
export const studentNav: SidebarNavItem[] = [{ to: "/estudiante", label: "Dashboard" }];
EOF

cat > src/features/teacher/pages/DashboardPage.tsx <<'EOF'
import PageHeader from "../../../shared/layout/PageHeader";
import TeacherDashboardCards from "../components/TeacherDashboardCards";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Panel del Profesor" subtitle="Clases, actividades y evaluaciones." />
      <TeacherDashboardCards />
    </div>
  );
}
EOF

cat > src/features/teacher/components/TeacherDashboardCards.tsx <<'EOF'
export default function TeacherDashboardCards() {
  const cards = [
    { t: "Cursos asignados", v: "—" },
    { t: "Evaluaciones por revisar", v: "—" },
    { t: "Mensajes", v: "—" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((k) => (
        <div key={k.t} className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm text-vp-muted">{k.t}</div>
          <div className="mt-2 text-2xl font-semibold">{k.v}</div>
          <div className="mt-2 text-xs text-vp-muted">Maqueta.</div>
        </div>
      ))}
    </div>
  );
}
EOF

cat > src/features/student/pages/DashboardPage.tsx <<'EOF'
import PageHeader from "../../../shared/layout/PageHeader";
import StudentDashboardCards from "../components/StudentDashboardCards";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Mi Aula" subtitle="Progreso, módulos y conexión IA." />
      <StudentDashboardCards />
    </div>
  );
}
EOF

cat > src/features/student/components/StudentDashboardCards.tsx <<'EOF'
export default function StudentDashboardCards() {
  const cards = [
    { t: "Progreso semanal", v: "—" },
    { t: "Módulos pendientes", v: "—" },
    { t: "Conexión IA disponible", v: "—" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((k) => (
        <div key={k.t} className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm text-vp-muted">{k.t}</div>
          <div className="mt-2 text-2xl font-semibold">{k.v}</div>
          <div className="mt-2 text-xs text-vp-muted">Maqueta.</div>
        </div>
      ))}
    </div>
  );
}
EOF

echo "✅ Scaffold multi-tenant creado/actualizado."