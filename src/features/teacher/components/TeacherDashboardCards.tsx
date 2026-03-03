export default function TeacherDashboardCards() {
  const cards = [
    { t: "Cursos asignados", v: "—" },
    { t: "Evaluaciones por revisar", v: "—" },
    { t: "Mensajes", v: "—" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((k) => (
        <div key={k.t} className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm text-vp-muted">{k.t}</div>
          <div className="mt-2 text-2xl font-semibold">{k.v}</div>
          <div className="mt-2 text-xs text-vp-muted">Maqueta.</div>
        </div>
      ))}
    </div>
  );
}
