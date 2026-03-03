import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  TrendingUp,
  Flame,
  BookOpen,
  Bot,
} from "lucide-react";
import { getStudentAnalyticsMock } from "../../../services/courses/studentAnalytics.mock";

export default function StudentDashboardCards() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getStudentAnalyticsMock().then(setData);
  }, []);

  const sortedSubjects = useMemo(() => {
    if (!data) return [];
    return [...data.subjects].sort((a, b) => b.average - a.average);
  }, [data]);

  if (!data) return <div className="text-sm text-vp-muted">Cargando KPIs...</div>;

  const best = sortedSubjects[0];
  const worst = sortedSubjects[sortedSubjects.length - 1];

  return (
    <div className="space-y-6">

      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-4">

        <KpiCard
          icon={<TrendingUp size={20} />}
          label="Promedio General"
          value={data.globalAverage}
          highlight
        />

        <KpiCard
          icon={<Flame size={20} />}
          label="Racha de Estudio"
          value={`${data.streakDays} días`}
        />

        <KpiCard
          icon={<Trophy size={20} />}
          label="Mejor Asignatura"
          value={best.name}
          sub={`${best.average} promedio`}
        />

        <KpiCard
          icon={<BookOpen size={20} />}
          label="Asignatura a Mejorar"
          value={worst.name}
          sub={`${worst.average} promedio`}
        />
      </div>

      {/* Ranking de asignaturas */}
      <div className="rounded-2xl border border-vp-border bg-vp-panel p-6">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Trophy size={18} />
          Ranking de Asignaturas
        </div>

        <div className="mt-4 space-y-3">
          {sortedSubjects.map((s, i) => (
            <div
              key={s.courseId}
              className="flex items-center justify-between rounded-xl border border-vp-border bg-vp-bg/30 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-vp-muted w-6">
                  #{i + 1}
                </span>
                <span className="text-sm font-medium">{s.name}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm">{s.average}</div>

                <div className="w-32 h-2 rounded-full bg-vp-bg/50 overflow-hidden">
                  <div
                    className="h-full bg-vp-primary"
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tutor Status */}
      <div className="rounded-2xl border border-vp-border bg-vp-bg/30 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot size={20} />
          <div>
            <div className="text-sm font-semibold">Tutor IA</div>
            <div className="text-xs text-vp-muted">
              Disponible solo al completar el curso activo.
            </div>
          </div>
        </div>

        <span className="text-xs text-vp-muted">
          Control académico activo
        </span>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border p-5",
        highlight
          ? "border-vp-primary/40 bg-vp-primary/10"
          : "border-vp-border bg-vp-panel",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-xs text-vp-muted">
        {icon}
        {label}
      </div>

      <div className="mt-2 text-2xl font-semibold">{value}</div>

      {sub && (
        <div className="mt-1 text-xs text-vp-muted">{sub}</div>
      )}
    </div>
  );
}