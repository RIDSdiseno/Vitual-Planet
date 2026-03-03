import PageHeader from "../../../shared/layout/PageHeader";
import StudentDashboardCards from "../components/StudentDashboardCards";
import StudentNotifications from "../components/StudentNotifications";


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Mi Aula" subtitle="Progreso, módulos y conexión IA." />
      <StudentDashboardCards />
      <StudentNotifications />
    </div>
  );
}
