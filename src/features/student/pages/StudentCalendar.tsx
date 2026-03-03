import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type { StudentCalendarEvent } from "../../../services/courses/studentCalendar.mock";
import { getStudentCalendarMock } from "../../../services/courses/studentCalendar.mock";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function monthLabel(d: Date) {
  try {
    return new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric" }).format(d);
  } catch {
    return `${d.getMonth() + 1}/${d.getFullYear()}`;
  }
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function dayOfWeekMonFirst(d: Date) {
  // JS: 0=Dom..6=Sab -> queremos 0=Lun..6=Dom
  const js = d.getDay();
  return (js + 6) % 7;
}

function typeDotClass(type: StudentCalendarEvent["type"]) {
  switch (type) {
    case "EXAM":
      return "bg-red-500";
    case "QUIZ":
      return "bg-amber-500";
    case "DEADLINE":
      return "bg-fuchsia-500";
    case "CLASS":
      return "bg-sky-500";
    case "ASSIGNMENT":
      return "bg-lime-500";
    default:
      return "bg-vp-primary";
  }
}

export default function StudentCalendar() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<StudentCalendarEvent[]>([]);
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedISO, setSelectedISO] = useState<string>(() => toISODate(new Date()));

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getStudentCalendarMock()
      .then((rows) => alive && setEvents(rows))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const monthDays = useMemo(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);

    const days: Date[] = [];
    // relleno previo (lunes-first)
    const leading = dayOfWeekMonFirst(start);
    for (let i = leading; i > 0; i--) {
      const d = new Date(start);
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    // mes actual
    for (let day = 1; day <= end.getDate(); day++) {
      days.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
    }

    // relleno final hasta completar semanas (múltiplos de 7)
    while (days.length % 7 !== 0) {
      const last = days[days.length - 1];
      const d = new Date(last);
      d.setDate(d.getDate() + 1);
      days.push(d);
    }

    return days;
  }, [cursor]);

  const eventsByDate = useMemo(() => {
    const m = new Map<string, StudentCalendarEvent[]>();
    for (const ev of events) {
      const arr = m.get(ev.date) ?? [];
      arr.push(ev);
      m.set(ev.date, arr);
    }
    // ordenar por hora si existe
    for (const [k, arr] of m.entries()) {
      arr.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
      m.set(k, arr);
    }
    return m;
  }, [events]);

  const selectedEvents = useMemo(() => {
    return eventsByDate.get(selectedISO) ?? [];
  }, [eventsByDate, selectedISO]);

  const monthKey = `${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}`;

  return (
    <div className="rounded-2xl border border-vp-border bg-vp-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-vp-border bg-vp-bg/30 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays size={18} />
          Calendario
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border border-vp-border bg-vp-bg/30 px-2.5 py-2 text-sm hover:border-vp-primary"
            onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            aria-label="Mes anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="min-w-[180px] text-center text-sm font-medium capitalize">
            {monthLabel(cursor)}
          </div>

          <button
            className="rounded-xl border border-vp-border bg-vp-bg/30 px-2.5 py-2 text-sm hover:border-vp-primary"
            onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            aria-label="Mes siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-2 text-xs text-vp-muted">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i} className="px-1 text-center font-semibold">
              {d}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2" key={monthKey}>
          {monthDays.map((d) => {
            const iso = toISODate(d);
            const inMonth = d.getMonth() === cursor.getMonth();
            const isSelected = iso === selectedISO;
            const isToday = iso === toISODate(new Date());
            const evs = eventsByDate.get(iso) ?? [];

            return (
              <button
                key={iso}
                onClick={() => setSelectedISO(iso)}
                className={[
                  "rounded-xl border px-2 py-2 text-left transition min-h-[64px]",
                  inMonth ? "border-vp-border bg-vp-bg/20" : "border-vp-border/50 bg-transparent opacity-60",
                  isSelected ? "ring-2 ring-vp-primary/40 border-vp-primary/40" : "hover:border-vp-primary/30",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div className={["text-xs font-semibold", isToday ? "text-vp-primary" : "text-vp-text"].join(" ")}>
                    {d.getDate()}
                  </div>

                  {evs.length > 0 && (
                    <div className="flex items-center gap-1">
                      {evs.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className={["h-2 w-2 rounded-full", typeDotClass(ev.type)].join(" ")}
                          title={ev.title}
                        />
                      ))}
                      {evs.length > 3 && (
                        <span className="text-[10px] text-vp-muted">+{evs.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  {evs.slice(0, 2).map((ev) => (
                    <div key={ev.id} className="truncate text-[11px] text-vp-muted">
                      {ev.time ? `${ev.time} • ` : ""}{ev.title}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm font-semibold">Eventos del día</div>
          <div className="mt-1 text-xs text-vp-muted">{selectedISO}</div>

          {loading ? (
            <div className="mt-3 text-sm text-vp-muted">Cargando...</div>
          ) : selectedEvents.length === 0 ? (
            <div className="mt-3 text-sm text-vp-muted">Sin eventos.</div>
          ) : (
            <div className="mt-3 space-y-2">
              {selectedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-xl border border-vp-border bg-vp-panel px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{ev.title}</div>
                      <div className="text-xs text-vp-muted">
                        {ev.courseName ? `${ev.courseName} • ` : ""}
                        {ev.time ? ev.time : "Sin hora"}
                      </div>
                    </div>

                    <span
                      className={[
                        "h-2.5 w-2.5 rounded-full",
                        typeDotClass(ev.type),
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </div>

                  {ev.description && (
                    <div className="mt-2 text-xs text-vp-muted">{ev.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}