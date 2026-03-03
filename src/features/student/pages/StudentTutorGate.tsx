import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/useAuth";
import { studentProgressRepoMock } from "../../../services/courses";

export default function StudentTutorGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [canUseTutor, setCanUseTutor] = useState(false);

  // Mock: “curso principal” del estudiante
  const mainCourseId = useMemo(() => "c1", []);

  useEffect(() => {
    if (!user) return;

    let alive = true;
    setLoading(true);

    studentProgressRepoMock
      .getProgress(user.id, mainCourseId)
      .then((p) => {
        if (!alive) return;
        setCanUseTutor(!!p?.completedAt);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [user, mainCourseId]);

  if (loading) return <div className="text-sm text-vp-muted">Cargando...</div>;

  if (!canUseTutor) {
    return <Navigate to={`/estudiante/cursos/${mainCourseId}`} replace />;
  }

  return <>{children}</>;
}