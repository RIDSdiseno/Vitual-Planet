import AppShell from "../shared/layout/AppShell";
import { teacherNav } from "../features/teacher/components/TeacherSidebarNav";

export default function TeacherLayout() {
  return (
    <AppShell brand={{ title: "Virtual Planet", subtitle: "Profesor" }} nav={teacherNav} />
  );
}
