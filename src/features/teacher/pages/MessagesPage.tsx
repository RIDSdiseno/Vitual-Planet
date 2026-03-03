import PageHeader from "../../../shared/layout/PageHeader";

export default function MessagesPage() {
  const threads = [
    { id: "m1", curso: "Matemáticas 6°", asunto: "Duda sobre fracciones", estado: "Nuevo" },
    { id: "m2", curso: "Física 10°", asunto: "Entrega laboratorio", estado: "Respondido" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Mensajes" subtitle="Mensajería docente ↔ estudiantes (mock)." />

      <div className="rounded-2xl border border-vp-border bg-vp-panel p-4">
        <div className="grid gap-3 md:grid-cols-2">
          {threads.map((t) => (
            <div key={t.id} className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
              <div className="text-xs text-vp-muted">{t.curso}</div>
              <div className="mt-1 font-medium">{t.asunto}</div>
              <div className="mt-2 text-xs text-vp-muted">Estado: {t.estado}</div>

              <div className="mt-3 flex gap-2">
                <button className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary">
                  Abrir
                </button>
                <button className="rounded-xl bg-vp-primary px-3 py-2 text-sm font-medium text-white hover:bg-vp-primary2">
                  Responder
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-vp-muted">
          En producción: conectar a tu mensajería (Firestore o servicio propio).
        </div>
      </div>
    </div>
  );
}