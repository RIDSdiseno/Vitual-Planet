import { Link } from "react-router-dom";
import PageHeader from "../../../shared/layout/PageHeader";
import TeacherDashboardCards from "../components/TeacherDashboardCards";

function KpiCard({
  title,
  value,
  subtitle,
  right,
}: {
  title: string;
  value: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-vp-muted">{title}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
          <div className="mt-2 text-xs text-vp-muted">{subtitle}</div>
        </div>
        {right}
      </div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-vp-border bg-vp-bg/30 px-2 py-0.5 text-xs">
      {text}
    </span>
  );
}

export default function DashboardPage() {
  // Mock KPIs (luego se conectan a tu service real)
  const kpis = {
    cursosActivos: 3,
    clasesHoy: 2,
    tareasPorRevisar: 7,
    evaluacionesProgramadas: 1,
    mensajesNuevos: 4,
    estudiantesEnRiesgo: 6,
  };

  const proximas = [
    {
      id: "ev1",
      when: "Hoy • 16:30",
      title: "Clase: Matemáticas 6° – Fracciones",
      meta: "Curso: Matemáticas 6°",
      badge: "CLASE",
    },
    {
      id: "ev2",
      when: "Mañana • 10:00",
      title: "Evaluación: Física 10° – Cinemática",
      meta: "IA bloqueada durante evaluación",
      badge: "EVALUACIÓN",
    },
    {
      id: "ev3",
      when: "Jueves • 18:00",
      title: "Revisión: Actividades pendientes",
      meta: "Revisión de entregas",
      badge: "REVISIÓN",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel del Profesor"
        subtitle="Resumen de clases, progreso y evaluaciones."
        right={
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary"
              to="/profesor/calendario"
            >
              Ver calendario
            </Link>
            <Link
              className="rounded-xl bg-vp-primary px-4 py-2 text-sm font-medium text-white hover:bg-vp-primary2"
              to="/profesor/cursos"
            >
              Gestionar cursos
            </Link>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="Cursos activos"
          value={String(kpis.cursosActivos)}
          subtitle="Cursos publicados o en ejecución"
        />
        <KpiCard
          title="Clases hoy"
          value={String(kpis.clasesHoy)}
          subtitle="Sesiones programadas para hoy"
        />
        <KpiCard
          title="Entregas por revisar"
          value={String(kpis.tareasPorRevisar)}
          subtitle="Actividades pendientes de corrección"
          right={
            <Link
              className="rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm hover:border-vp-primary"
              to="/profesor/evaluaciones"
            >
              Revisar
            </Link>
          }
        />
        <KpiCard
          title="Evaluaciones programadas"
          value={String(kpis.evaluacionesProgramadas)}
          subtitle="Quizzes / exámenes próximos"
        />
        <KpiCard
          title="Mensajes nuevos"
          value={String(kpis.mensajesNuevos)}
          subtitle="Consultas de estudiantes"
          right={
            <Link
              className="rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm hover:border-vp-primary"
              to="/profesor/mensajes"
            >
              Abrir
            </Link>
          }
        />
        <KpiCard
          title="Estudiantes en riesgo"
          value={String(kpis.estudiantesEnRiesgo)}
          subtitle="Bajo avance o baja asistencia (mock)"
        />
      </div>

      {/* Próximos eventos */}
      <div className="rounded-2xl border border-vp-border overflow-hidden">
        <div className="bg-vp-bg/50 px-4 py-3 text-sm font-semibold">
          Próximas actividades
        </div>
        <div className="bg-vp-panel">
          <table className="w-full text-sm">
            <thead className="text-vp-muted">
              <tr>
                <th className="px-4 py-3 text-left">Cuándo</th>
                <th className="px-4 py-3 text-left">Actividad</th>
                <th className="px-4 py-3 text-left">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {proximas.map((e) => (
                <tr key={e.id} className="border-t border-vp-border">
                  <td className="px-4 py-3 text-vp-muted">{e.when}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{e.title}</div>
                    <div className="text-xs text-vp-muted">{e.meta}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge text={e.badge} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lo que ya tenías (cards extra) */}
      <TeacherDashboardCards />
    </div>
  );
}