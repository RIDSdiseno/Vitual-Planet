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

/* Teacher */
import TeacherDashboardPage from "../features/teacher/pages/DashboardPage";
import TeacherCoursesPage from "../features/teacher/pages/CoursesPage";
import TeacherCourseDetailPage from "../features/teacher/pages/CourseDetailPage";
import TeacherEvaluationsPage from "../features/teacher/pages/EvaluationsPage";
import TeacherMessagesPage from "../features/teacher/pages/MessagesPage";
import TeacherCalendarPage from "../features/teacher/pages/CalendarPage";

/* Student */
import StudentDashboardPage from "../features/student/pages/DashboardPage";
import StudentTutorPage from "../features/student/pages/StudentTutorPage";

// Cursos + Gate tutor
import StudentCoursesPage from "../features/student/pages/CoursesPage";
import StudentCourseDetailPage from "../features/student/pages/CourseDetailPage";
import StudentTutorGate from "../features/student/pages/StudentTutorGate";

// Calendario
import StudentCalendarPage from "../features/student/pages/StudentCalendar";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.admin} replace />} />

      {/* ADMIN */}
      <Route
        path={ROUTES.admin}
        element={
          <RoleGuard allow={["ADMIN"]} redirectTo={"/"}>
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

      {/* PROFESOR */}
      <Route
        path={ROUTES.teacher}
        element={
          <RoleGuard allow={["PROFESOR"]} redirectTo={"/"}>
            <TeacherLayout />
          </RoleGuard>
        }
      >
        <Route index element={<TeacherDashboardPage />} />
        <Route path="cursos" element={<TeacherCoursesPage />} />
        <Route path="cursos/:courseId" element={<TeacherCourseDetailPage />} />
        <Route path="evaluaciones" element={<TeacherEvaluationsPage />} />
        <Route path="mensajes" element={<TeacherMessagesPage />} />
        <Route path="calendario" element={<TeacherCalendarPage />} />
      </Route>

      {/* ESTUDIANTE */}
      <Route
        path={ROUTES.student}
        element={
          <RoleGuard allow={["ESTUDIANTE"]} redirectTo={"/"}>
            <StudentLayout />
          </RoleGuard>
        }
      >
        <Route index element={<StudentDashboardPage />} />

        {/* Cursos */}
        <Route path="cursos" element={<StudentCoursesPage />} />
        <Route path="cursos/:courseId" element={<StudentCourseDetailPage />} />

        {/* Calendario */}
        <Route path="calendario" element={<StudentCalendarPage />} />

        {/* Tutor: BLOQUEADO hasta completar el curso */}
        <Route
          path="tutor"
          element={
            <StudentTutorGate>
              <StudentTutorPage />
            </StudentTutorGate>
          }
        />
      </Route>

      <Route path="*" element={<div className="p-6">404</div>} />
    </Routes>
  );
}