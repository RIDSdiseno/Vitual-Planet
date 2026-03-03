import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import type { StudentNotification } from "../../../services/courses/studentCalendar.mock";
import { getStudentNotificationsMock } from "../../../services/courses/studentCalendar.mock";

function levelStyle(level: StudentNotification["level"]) {
  switch (level) {
    case "SUCCESS":
      return "border-emerald-500/20 bg-emerald-500/10";
    case "WARNING":
      return "border-amber-500/20 bg-amber-500/10";
    case "DANGER":
      return "border-red-500/20 bg-red-500/10";
    default:
      return "border-vp-border bg-vp-bg/30";
  }
}

function levelIcon(level: StudentNotification["level"]) {
  switch (level) {
    case "SUCCESS":
      return <CheckCircle2 size={16} />;
    case "WARNING":
      return <AlertTriangle size={16} />;
    case "DANGER":
      return <XCircle size={16} />;
    default:
      return <Info size={16} />;
  }
}

export default function StudentNotifications() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<StudentNotification[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getStudentNotificationsMock()
      .then((rows) => alive && setItems(rows))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const ordered = useMemo(() => {
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items]);

  return (
    <div className="rounded-2xl border border-vp-border bg-vp-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-vp-border bg-vp-bg/30 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Bell size={18} />
          Notificaciones
        </div>

        <div className="text-xs text-vp-muted">
          {loading ? "Cargando..." : `${ordered.length}`}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-sm text-vp-muted">Cargando...</div>
        ) : ordered.length === 0 ? (
          <div className="text-sm text-vp-muted">Sin notificaciones.</div>
        ) : (
          ordered.map((n) => (
            <div
              key={n.id}
              className={[
                "rounded-2xl border p-4",
                levelStyle(n.level),
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-vp-muted">{levelIcon(n.level)}</div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-semibold">{n.title}</div>
                    <div className="shrink-0 text-xs text-vp-muted">{n.createdAt}</div>
                  </div>

                  <div className="mt-1 text-sm text-vp-muted">{n.message}</div>

                  {n.actionLabel && n.actionTo && (
                    <div className="mt-3">
                      <Link
                        to={n.actionTo}
                        className="inline-flex items-center rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-xs hover:border-vp-primary"
                      >
                        {n.actionLabel}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}