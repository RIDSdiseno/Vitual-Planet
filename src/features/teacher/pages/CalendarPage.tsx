import { useMemo, useState } from "react";
import PageHeader from "../../../shared/layout/PageHeader";

type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: "CLASE" | "EVALUACIÓN" | "REUNIÓN" | "REVISIÓN";
  title: string;
  course?: string;
  notes?: string;
};

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-vp-border bg-vp-bg/30 px-2 py-0.5 text-xs">
      {text}
    </span>
  );
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function addMonths(base: Date, delta: number) {
  const d = new Date(base);
  d.setMonth(d.getMonth() + delta);
  return d;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function startOfWeekSunday(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay(); // 0..6 (Sun..Sat)
  x.setDate(x.getDate() - day);
  return x;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEKDAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function CalendarPage() {
  // Mock events
  const [events] = useState<CalendarEvent[]>([
    {
      id: "e1",
      date: "2026-03-02",
      time: "16:30",
      type: "CLASE",
      title: "Clase: Fracciones",
      course: "Matemáticas 6°",
      notes: "Contenido + Actividad. Conexión IA solo al final.",
    },
    {
      id: "e2",
      date: "2026-03-03",
      time: "10:00",
      type: "EVALUACIÓN",
      title: "Quiz: Cinemática",
      course: "Física 10°",
      notes: "IA bloqueada durante evaluación.",
    },
    {
      id: "e3",
      date: "2026-03-05",
      time: "18:00",
      type: "REVISIÓN",
      title: "Revisión de actividades pendientes",
      notes: "Cerrar pendientes de la semana.",
    },
  ]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<string>(() => toISODate(today));

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    // ordenar por hora
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.time.localeCompare(b.time));
      map.set(k, arr);
    }
    return map;
  }, [events]);

  const dayEvents = useMemo(() => eventsByDate.get(selectedDate) ?? [], [eventsByDate, selectedDate]);

  const gridDays = useMemo(() => {
    const start = startOfWeekSunday(startOfMonth(viewMonth));
    const end = endOfMonth(viewMonth);

    const out: Date[] = [];
    const cur = new Date(start);

    // 6 semanas (42 celdas) para layout estable
    for (let i = 0; i < 42; i++) {
      out.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    // Si el mes cabe en 5 semanas, igual dejamos 6 para estabilidad (estilo Google Calendar)
    // (no necesitamos recortar)
    void end;
    return out;
  }, [viewMonth]);

  const monthLabel = `${MONTHS_ES[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`;

  function isInViewMonth(d: Date) {
    return d.getMonth() === viewMonth.getMonth() && d.getFullYear() === viewMonth.getFullYear();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario"
        subtitle="Clases, evaluaciones y actividades del profesor (mock)."
        right={
          <button className="rounded-xl bg-vp-primary px-4 py-2 text-sm font-medium text-white hover:bg-vp-primary2">
            Crear evento (mock)
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Calendario mensual */}
        <div className="lg:col-span-2 rounded-2xl border border-vp-border bg-vp-panel overflow-hidden">
          {/* Header mes */}
          <div className="flex items-center justify-between gap-3 border-b border-vp-border bg-vp-bg/40 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm text-vp-muted">Mes</div>
              <div className="text-lg font-semibold">{monthLabel}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm hover:border-vp-primary"
                onClick={() => setViewMonth((m) => startOfMonth(addMonths(m, -1)))}
              >
                Anterior
              </button>
              <button
                className="rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm hover:border-vp-primary"
                onClick={() => {
                  setViewMonth(startOfMonth(today));
                  setSelectedDate(toISODate(today));
                }}
              >
                Hoy
              </button>
              <button
                className="rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm hover:border-vp-primary"
                onClick={() => setViewMonth((m) => startOfMonth(addMonths(m, 1)))}
              >
                Siguiente
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="p-4">
            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAYS_ES.map((w) => (
                <div key={w} className="px-2 pb-1 text-xs font-semibold text-vp-muted">
                  {w}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {gridDays.map((d) => {
                const iso = toISODate(d);
                const active = iso === selectedDate;
                const inMonth = isInViewMonth(d);
                const isToday = sameDay(d, today);
                const count = eventsByDate.get(iso)?.length ?? 0;

                return (
                  <button
                    key={iso}
                    onClick={() => setSelectedDate(iso)}
                    className={[
                      "relative rounded-2xl border px-2 py-2 text-left transition",
                      active ? "border-vp-primary bg-vp-bg/30" : "border-vp-border bg-vp-bg/20 hover:border-vp-primary",
                      inMonth ? "" : "opacity-60",
                    ].join(" ")}
                    title={prettyDate(iso)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={[
                          "grid h-7 w-7 place-items-center rounded-xl text-sm font-medium",
                          isToday ? "border border-vp-primary bg-vp-primary/15" : "bg-transparent",
                        ].join(" ")}
                      >
                        {d.getDate()}
                      </div>

                      {count > 0 ? (
                        <span className="inline-flex items-center rounded-full border border-vp-border bg-vp-panel px-2 py-0.5 text-[11px] text-vp-muted">
                          {count}
                        </span>
                      ) : null}
                    </div>

                    {/* mini indicadores */}
                    {count > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(eventsByDate.get(iso) ?? []).slice(0, 2).map((e) => (
                          <span
                            key={e.id}
                            className="inline-flex max-w-full items-center truncate rounded-full border border-vp-border bg-vp-bg/30 px-2 py-0.5 text-[11px]"
                          >
                            {e.type}
                          </span>
                        ))}
                        {count > 2 ? (
                          <span className="text-[11px] text-vp-muted">+{count - 2}</span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-2 h-[18px]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 text-xs text-vp-muted">
              Tip: haz click en un día para ver el detalle a la derecha.
            </div>
          </div>
        </div>

        {/* Panel eventos del día */}
        <div className="rounded-2xl border border-vp-border overflow-hidden">
          <div className="bg-vp-bg/50 px-4 py-3 text-sm font-semibold">
            Eventos • {prettyDate(selectedDate)}
          </div>

          <div className="bg-vp-panel">
            {dayEvents.length === 0 ? (
              <div className="px-4 py-6 text-sm text-vp-muted">Sin eventos para este día.</div>
            ) : (
              <div className="divide-y divide-vp-border">
                {dayEvents.map((e) => (
                  <div key={e.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-vp-muted">{e.time}</div>
                        <div className="mt-1 font-medium">{e.title}</div>
                        <div className="mt-1 text-xs text-vp-muted">
                          {e.course ? `${e.course} • ` : ""}
                          {e.notes ?? ""}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Badge text={e.type} />
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary">
                        Editar (mock)
                      </button>
                      <button className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary">
                        Ver curso
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-vp-panel px-4 pb-4 text-xs text-vp-muted">
            En producción: aquí se conecta a tu API y se agregan filtros por curso/docente.
          </div>
        </div>
      </div>
    </div>
  );
}