import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../shared/layout/PageHeader";
import { useAuth } from "../../../core/auth/useAuth";
import {
  studentProgressRepoMock,
  type CourseWithModules,
  type StudentCourseProgress,
} from "../../../services/courses";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Presentation,
} from "lucide-react";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [progress, setProgress] = useState<StudentCourseProgress | null>(null);

  // slide mode
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!courseId || !user) return;

    let alive = true;
    setLoading(true);

    Promise.all([
      studentProgressRepoMock.getCourseById(courseId),
      studentProgressRepoMock.getProgress(user.id, courseId),
    ])
      .then(([c, p]) => {
        if (!alive) return;
        setCourse(c);
        setProgress(p);

        // posicionar en el primer módulo pendiente (o el último si está completo)
        if (c) {
          const completedIds = p?.completedModuleIds ?? [];
          const firstPending = c.modules.findIndex((m) => !completedIds.includes(m.id));
          const nextIndex = firstPending === -1 ? Math.max(0, c.modules.length - 1) : firstPending;
          setIdx(nextIndex);
        }
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [courseId, user]);

  const completedIds = progress?.completedModuleIds ?? [];
  const isCompleted = !!progress?.completedAt;

  const totalModules = course?.modules.length ?? 0;
  const completedCount = completedIds.length;
  const progressPct = pct(completedCount, totalModules);

  const nextModule = useMemo(() => {
    if (!course) return null;
    return course.modules.find((m) => !completedIds.includes(m.id)) ?? null;
  }, [course, completedIds]);

  const current = useMemo(() => {
    if (!course) return null;
    const safe = clamp(idx, 0, Math.max(0, course.modules.length - 1));
    return course.modules[safe] ?? null;
  }, [course, idx]);

  const currentIndexSafe = useMemo(() => {
    if (!course) return 0;
    return clamp(idx, 0, Math.max(0, course.modules.length - 1));
  }, [course, idx]);

  const currentDone = current ? completedIds.includes(current.id) : false;

  const currentLocked = useMemo(() => {
    if (!course || !current) return false;
    const i = currentIndexSafe;
    if (i <= 0) return false; // primer módulo nunca está bloqueado
    if (completedIds.includes(current.id)) return false; // si está hecho, no bloquea
    const prev = course.modules[i - 1];
    return !completedIds.includes(prev.id);
  }, [course, current, currentIndexSafe, completedIds]);

  async function markDone(moduleId: string) {
    if (!user || !courseId) return;
    const updated = await studentProgressRepoMock.markModuleDone(user.id, courseId, moduleId);
    setProgress({ ...updated });
  }

  function goPrev() {
    if (!course) return;
    setIdx((v) => clamp(v - 1, 0, course.modules.length - 1));
  }

  function goNext() {
    if (!course) return;
    setIdx((v) => clamp(v + 1, 0, course.modules.length - 1));
  }

  if (loading) return <div className="text-sm text-vp-muted">Cargando...</div>;
  if (!course) return <div className="text-sm text-vp-muted">Curso no encontrado.</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={course.titulo}
        subtitle={
          isCompleted
            ? `Curso completado el ${progress?.completedAt}`
            : nextModule
              ? `Siguiente módulo: ${nextModule.title}`
              : "En progreso"
        }
        right={
          <Link
            className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary"
            to="/estudiante/cursos"
          >
            Volver
          </Link>
        }
      />

      {/* Barra de progreso */}
      <div className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Progreso del curso</div>
            <div className="text-xs text-vp-muted">
              {completedCount}/{totalModules} módulos completados • {progressPct}%
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-vp-muted">
            <Presentation size={16} />
            <span>
              Diapositiva {currentIndexSafe + 1} / {totalModules || 1}
            </span>
          </div>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-vp-bg/60">
          <div className="h-full bg-vp-primary" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Vista tipo PPT (1 módulo a la vez) */}
      <div className="rounded-2xl border border-vp-border bg-vp-panel shadow-soft overflow-hidden">
        <div className="flex items-center justify-between border-b border-vp-border bg-vp-bg/30 px-4 py-3">
          <div className="min-w-0">
            <div className="text-xs text-vp-muted">Módulo</div>
            <div className="truncate text-sm font-semibold">
              {current ? current.title : "—"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentLocked ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-vp-border bg-vp-bg/40 px-2 py-1 text-xs text-vp-muted">
                <Lock size={14} /> Bloqueado
              </span>
            ) : currentDone ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-vp-border bg-vp-bg/40 px-2 py-1 text-xs text-vp-muted">
                <CheckCircle2 size={14} /> Completado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-vp-border bg-vp-bg/40 px-2 py-1 text-xs text-vp-muted">
                Pendiente
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Contenido “slide” (mock) */}
          <div className="rounded-2xl border border-vp-border bg-white p-6">
            <div className="text-xs text-vp-muted">
              Diapositiva {currentIndexSafe + 1} de {totalModules || 1}
            </div>

            <h2 className="mt-2 text-2xl font-semibold">
              {current?.title ?? "Contenido"}
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
              <p>
                Aquí va el contenido del módulo en formato tipo presentación. Puedes
                mostrar texto, bullets, imágenes, video o embeds.
              </p>

              <ul className="list-disc pl-5 space-y-1">
                <li>Idea clave 1 del módulo</li>
                <li>Idea clave 2 del módulo</li>
                <li>Ejemplo o ejercicio guiado</li>
              </ul>

              <p className="text-xs text-vp-muted">
                (Mock) Después podemos conectar esto a contenido real por módulo.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-vp-muted">
                {currentLocked
                  ? "Completa el módulo anterior para desbloquear este contenido."
                  : currentDone
                    ? "Ya completaste este módulo."
                    : "Cuando termines, marca el módulo como completado."}
              </div>

              <div className="flex items-center gap-2">
                {!currentDone && (
                  <button
                    className={[
                      "rounded-xl px-4 py-2 text-sm font-medium text-white",
                      currentLocked
                        ? "bg-vp-primary/40 cursor-not-allowed"
                        : "bg-vp-primary hover:bg-vp-primary2",
                    ].join(" ")}
                    disabled={currentLocked}
                    onClick={() => current && markDone(current.id)}
                  >
                    Marcar como completado
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navegación de diapositivas */}
          <div className="mt-4 flex items-center justify-between">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary disabled:opacity-50"
              onClick={goPrev}
              disabled={currentIndexSafe <= 0}
            >
              <ChevronLeft size={18} />
              Anterior
            </button>

            <div className="text-xs text-vp-muted">
              {course.modules[currentIndexSafe]?.title ?? "—"}
            </div>

            <button
              className="inline-flex items-center gap-2 rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm hover:border-vp-primary disabled:opacity-50"
              onClick={goNext}
              disabled={currentIndexSafe >= (course.modules.length - 1)}
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tutor opcional (no obligatorio) */}
      {isCompleted ? (
        <div className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold">¿Tienes dudas finales?</div>
            <div className="text-xs text-vp-muted">
              El Tutor IA es opcional. Úsalo solo si tienes preguntas después de completar el curso.
            </div>
          </div>

          <Link
            to="/estudiante/tutor"
            className="inline-flex items-center justify-center rounded-xl border border-vp-border bg-vp-panel px-4 py-2 text-sm hover:border-vp-primary"
          >
            Consultar Tutor IA
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm font-semibold">Tutor IA</div>
          <div className="mt-1 text-xs text-vp-muted">
            Se habilita cuando completes el curso (para dudas finales).
          </div>
        </div>
      )}
    </div>
  );
}