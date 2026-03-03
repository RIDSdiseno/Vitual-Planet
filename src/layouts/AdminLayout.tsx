import AppShell from "../shared/layout/AppShell";
import { adminNav } from "../features/admin/components/AdminSidebarNav";

export default function AdminLayout() {
  return (
    <AppShell brand={{ title: "Virtual Planet", subtitle: "Admin (Multi-tenant)" }} nav={adminNav} />
  );
}
