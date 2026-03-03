import PageHeader from "../../../shared/layout/PageHeader";

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-vp-border bg-vp-bg/30 px-2 py-0.5 text-xs">
      {text}
    </span>
  );
}

export default function EvaluationsPage() {
  const rows = [
    { id: "qz_1", curso: "Matemáticas 6°", tipo: "Quiz", estado: "Por revisar", ia: "BLOQUEADA" },
    { id: "ex_2", curso: "Física 10°", tipo: "Examen", estado: "Programada", ia: "BLOQUEADA" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluaciones"
        subtitle="Quizzes y exámenes (mock). Dentro del examen, la IA debe quedar deshabilitada."
      />

      <div className="overflow-hidden rounded-2xl border border-vp-border">
        <table className="w-full text-sm">
          <thead className="bg-vp-bg/50 text-vp-muted">
            <tr>
              <th className="px-4 py-3 text-left">Curso</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">IA</th>
            </tr>
          </thead>

          <tbody className="bg-vp-panel">
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-vp-border">
                <td className="px-4 py-3">{r.curso}</td>
                <td className="px-4 py-3"><Badge text={r.tipo} /></td>
                <td className="px-4 py-3"><Badge text={r.estado} /></td>
                <td className="px-4 py-3"><Badge text={r.ia} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-vp-muted">
        Nota: en producción, “IA BLOQUEADA” significa que el widget/SDK del avatar no se renderiza en la vista de evaluación.
      </div>
    </div>
  );
}