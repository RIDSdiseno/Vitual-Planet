import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../shared/layout/PageHeader";

type BlockType = "CONTENT" | "ACTIVITY" | "AI" | "QUIZ";

type Block = {
  id: string;
  type: BlockType;
  title: string;
  notes?: string;

  // Solo AI
  aiEnabled?: boolean;
  aiWindowMinutes?: number;

  // Solo QUIZ
  aiBlockedInQuiz?: boolean;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-vp-border bg-vp-bg/30 px-2 py-0.5 text-xs">
      {text}
    </span>
  );
}

export default function CourseDetailPage() {
  const { courseId } = useParams();

  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: uid(),
      type: "CONTENT",
      title: "Contenido: Teoría y recursos",
      notes: "Lecturas/videos. Aquí NO aparece el avatar.",
    },
    {
      id: uid(),
      type: "ACTIVITY",
      title: "Actividad: Taller / laboratorio",
      notes: "Consigna y entrega.",
    },
    {
      id: uid(),
      type: "AI",
      title: "Conexión IA (Avatar tutor)",
      aiEnabled: true,
      aiWindowMinutes: 15,
      notes: "Disponible solo para dudas puntuales en esta sección.",
    },
    {
      id: uid(),
      type: "QUIZ",
      title: "Quiz / Evaluación",
      aiBlockedInQuiz: true,
      notes: "IA bloqueada dentro del examen.",
    },
  ]);

  const stats = useMemo(() => {
    const aiBlocks = blocks.filter((b) => b.type === "AI").length;
    const quizBlocks = blocks.filter((b) => b.type === "QUIZ").length;
    return { aiBlocks, quizBlocks };
  }, [blocks]);

  function setBlock(id: string, patch: Partial<Block>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function addBlock(type: BlockType) {
    const base: Block = { id: uid(), type, title: "Nuevo bloque" };

    if (type === "CONTENT") base.title = "Contenido";
    if (type === "ACTIVITY") base.title = "Actividad";

    if (type === "AI") {
      base.title = "Conexión IA (Avatar tutor)";
      base.aiEnabled = true;
      base.aiWindowMinutes = 15;
      base.notes = "Disponible solo en esta sección.";
    }

    if (type === "QUIZ") {
      base.title = "Quiz / Evaluación";
      base.aiBlockedInQuiz = true;
      base.notes = "IA bloqueada dentro del examen.";
    }

    setBlocks((prev) => [...prev, base]);
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Curso ${courseId ?? ""}`}
        subtitle="Constructor por bloques (mock)."
        right={
          <Link
            className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary"
            to="/profesor/cursos"
          >
            Volver
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm text-vp-muted">Bloques totales</div>
          <div className="mt-2 text-2xl font-semibold">{blocks.length}</div>
        </div>
        <div className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm text-vp-muted">Conexión IA</div>
          <div className="mt-2 text-2xl font-semibold">{stats.aiBlocks}</div>
        </div>
        <div className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm text-vp-muted">Evaluaciones</div>
          <div className="mt-2 text-2xl font-semibold">{stats.quizBlocks}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-vp-border bg-vp-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold">Bloques del módulo</div>

          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary"
              onClick={() => addBlock("CONTENT")}
            >
              + Contenido
            </button>
            <button
              className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary"
              onClick={() => addBlock("ACTIVITY")}
            >
              + Actividad
            </button>
            <button
              className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary"
              onClick={() => addBlock("AI")}
            >
              + Conexión IA
            </button>
            <button
              className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary"
              onClick={() => addBlock("QUIZ")}
            >
              + Evaluación
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {blocks.map((b) => (
            <div key={b.id} className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge text={b.type} />

                    <input
                      className="w-full max-w-[520px] rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm outline-none focus:border-vp-primary"
                      value={b.title}
                      onChange={(e) => setBlock(b.id, { title: e.target.value })}
                    />
                  </div>

                  <textarea
                    className="mt-2 w-full rounded-xl border border-vp-border bg-vp-panel px-3 py-2 text-sm outline-none focus:border-vp-primary"
                    rows={2}
                    placeholder="Notas del bloque..."
                    value={b.notes ?? ""}
                    onChange={(e) => setBlock(b.id, { notes: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary"
                    onClick={() => removeBlock(b.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {b.type === "AI" && (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-vp-border bg-vp-panel p-3">
                    <div className="text-sm font-medium">Conexión IA</div>

                    <label className="mt-2 flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!b.aiEnabled}
                        onChange={(e) => setBlock(b.id, { aiEnabled: e.target.checked })}
                      />
                      Habilitar IA en este bloque
                    </label>

                    <div className="mt-2 text-sm">
                      Ventana (min):
                      <input
                        className="ml-2 w-20 rounded-xl border border-vp-border bg-vp-bg/30 px-2 py-1 text-sm outline-none focus:border-vp-primary"
                        type="number"
                        min={1}
                        value={b.aiWindowMinutes ?? 15}
                        onChange={(e) => setBlock(b.id, { aiWindowMinutes: Number(e.target.value || 15) })}
                      />
                    </div>

                    <div className="mt-2 text-xs text-vp-muted">
                      Sugerencia: solo dudas puntuales en esta sección.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-vp-border bg-vp-panel p-3">
                    <div className="text-sm font-medium">Reglas</div>
                    <div className="mt-2 text-xs text-vp-muted">
                      En producción, este bloque define dónde se renderiza el widget/SDK del avatar.
                    </div>
                  </div>
                </div>
              )}

              {b.type === "QUIZ" && (
                <div className="mt-3 rounded-2xl border border-vp-border bg-vp-panel p-3">
                  <div className="text-sm font-medium">Evaluación</div>
                  <div className="mt-2 text-sm">
                    IA en examen:{" "}
                    <span className="font-semibold">{b.aiBlockedInQuiz ? "BLOQUEADA" : "HABILITADA"}</span>
                  </div>
                  <div className="mt-2 text-xs text-vp-muted">
                    En producción esto impide que el avatar aparezca en pantalla de evaluación.
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-xl border border-vp-border bg-vp-bg/30 px-4 py-2 text-sm hover:border-vp-primary">
            Guardar cambios (mock)
          </button>
          <button className="rounded-xl bg-vp-primary px-4 py-2 text-sm font-medium text-white hover:bg-vp-primary2">
            Publicar (mock)
          </button>
        </div>
      </div>
    </div>
  );
}