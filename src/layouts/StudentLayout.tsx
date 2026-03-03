import AppShell from "../shared/layout/AppShell";
import { studentNav } from "../features/student/components/StudentSidebarNav";

export default function StudentLayout() {
  return (
    <AppShell brand={{ title: "Virtual Planet", subtitle: "Estudiante" }} nav={studentNav} />
  );
}