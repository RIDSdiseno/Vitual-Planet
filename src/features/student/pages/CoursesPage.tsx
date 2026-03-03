import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../shared/layout/PageHeader";
import { studentProgressRepoMock, type Course } from "../../../services/courses";

function formatUpdatedAt(value: unknown) {
  if (!value) return "—";

  // Soporta Date o string (ISO u otros)
  const d =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;

  if (!d || Number.isNaN(d.getTime())) return String(value);

  // Formato simple dd/mm/yyyy
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function CoursesPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setError(null);

    studentProgressRepoMock
      .getCourses()
      .then((rows) => {
        if (!alive) return;
        setItems(Array.isArray(rows) ? rows : []);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message ?? "No se pudieron cargar los cursos.");
        setItems([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const content = useMemo(() => {
    if (loading) return <div className="text-sm text-vp-muted">Cargando...</div>;

    if (error)
      return (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
          <div className="font-semibold">Ocurrió un error</div>
          <div className="mt-1 text-vp-muted">{error}</div>
        </div>
      );

    if (items.length === 0)
      return <div className="text-sm text-vp-muted">No hay cursos.</div>;

    return items.map((c: any) => {
      // No asumimos que exista `modules` en el tipo `Course`.
      // Si viene, lo usamos. Si no, 0.
      const modulesCount = Array.isArray(c?.modules) ? c.modules.length : 0;

      return (
        <div
          key={c.id}
          className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4"
        >
          <div className="text-sm text-vp-muted">Curso</div>

          <div className="mt-1 text-lg font-semibold">
            {c.titulo ?? c.title ?? "Sin título"}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-vp-muted">
            <span>
              Módulos: <span className="text-vp-text">{modulesCount}</span>
            </span>
            <span className="opacity-50">•</span>
            <span>
              Actualizado:{" "}
              <span className="text-vp-text">
                {formatUpdatedAt(c.updatedAt)}
              </span>
            </span>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <Link
              to={`/estudiante/cursos/${c.id}`}
              className="rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm hover:border-vp-primary"
            >
              Ver curso
            </Link>
          </div>
        </div>
      );
    });
  }, [error, items, loading]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Cursos"
        subtitle="Completa el curso para habilitar el Tutor IA."
      />

      <div className="grid gap-4 md:grid-cols-2">{content}</div>
    </div>
  );
}