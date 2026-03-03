import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../shared/layout/PageHeader";
import { coursesRepoMock, type Course } from "../../../services/courses";

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-vp-border bg-vp-bg/30 px-2 py-0.5 text-xs">
      {text}
    </span>
  );
}

export default function CoursesPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Course[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    coursesRepoMock
      .list()
      .then((rows) => alive && setItems(rows))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cursos"
        subtitle="Gestiona módulos, actividades, Conexión IA y evaluaciones (mock)."
        right={
          <button className="rounded-xl bg-vp-primary px-4 py-2 text-sm font-medium text-white hover:bg-vp-primary2">
            Crear curso (mock)
          </button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-vp-border">
        <table className="w-full text-sm">
          <thead className="bg-vp-bg/50 text-vp-muted">
            <tr>
              <th className="px-4 py-3 text-left">Curso</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Actualizado</th>
              <th className="px-4 py-3 text-left"></th>
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
                  Sin cursos asignados (mock).
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="border-t border-vp-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.titulo}</div>
                    <div className="text-xs text-vp-muted">
                      Estructura: Contenido → Actividad → Conexión IA → Evaluación
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <Badge text={c.status} />
                  </td>

                  <td className="px-4 py-3 text-vp-muted">{c.updatedAt}</td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary"
                      to={`/profesor/cursos/${c.id}`}
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}