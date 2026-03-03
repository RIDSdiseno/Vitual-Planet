import { useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "../../../shared/layout/PageHeader";
import AvatarModel from "../components/avatar/AvatarModel";

type Msg = { id: string; role: "student" | "tutor"; text: string };

const TOPICS = [
  "Fracciones",
  "Ecuaciones lineales",
  "Comprensión lectora",
  "Sistema solar",
] as const;

type Topic = (typeof TOPICS)[number];

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function pickMockAnswer(topic: Topic, question: string) {
  const q = question.toLowerCase();

  if (topic === "Fracciones") {
    if (q.includes("sum") || q.includes("+") || q.includes("rest") || q.includes("-")) {
      return "Para sumar o restar fracciones: 1) busca un denominador común, 2) opera numeradores, 3) simplifica.";
    }
    return "Fracciones: numerador arriba y denominador abajo. ¿Qué parte te cuesta?";
  }

  if (topic === "Ecuaciones lineales") {
    return "En ecuaciones lineales queremos dejar la incógnita sola. Escríbeme la ecuación y la resolvemos paso a paso.";
  }

  if (topic === "Comprensión lectora") {
    return "Dime la idea principal y dos detalles del texto. Luego revisamos juntos.";
  }

  if (topic === "Sistema solar") {
    return "El sistema solar está formado por el Sol y ocho planetas. ¿Qué planeta quieres estudiar?";
  }

  return "Cuéntame tu pregunta y avanzamos.";
}

function speak(text: string, onStart?: () => void, onEnd?: () => void) {
  const synth = window.speechSynthesis;
  if (!synth) return;

  synth.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-CL";
  u.rate = 1.02;

  u.onstart = () => onStart?.();
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();

  synth.speak(u);
}

function mouthLevelFromFloat(v: number): 0 | 1 | 2 {
  if (v >= 0.66) return 2;
  if (v >= 0.33) return 1;
  return 0;
}

export default function StudentTutorPage() {
  const [topic, setTopic] = useState<Topic>("Fracciones");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: uid(), role: "tutor", text: "Hola. Soy tu tutor. Elige un tema y dime tu duda." },
  ]);

  const [status, setStatus] = useState<"idle" | "thinking" | "speaking">("idle");

  // mouth float (0..1) => mouthLevel 0|1|2
  const [mouthFloat, setMouthFloat] = useState(0);
  const mouthLevel = useMemo(() => mouthLevelFromFloat(mouthFloat), [mouthFloat]);

  const animRef = useRef<number | null>(null);
  const lastMouthTickRef = useRef<number>(0);
  const endRef = useRef<HTMLDivElement | null>(null);
  const thinkingTimeoutRef = useRef<number | null>(null);

  // Para dimensionar el avatar al alto disponible
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [avatarSize, setAvatarSize] = useState(520);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (thinkingTimeoutRef.current) window.clearTimeout(thinkingTimeoutRef.current);
      window.speechSynthesis?.cancel?.();
    };
  }, []);

  // Avatar size: usa el alto disponible del stage (pero con techo)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      const base = Math.min(r.width, r.height);
      const s = Math.floor(Math.max(360, Math.min(base * 0.98, 720)));
      setAvatarSize(s);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function startMouthAnim() {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    lastMouthTickRef.current = 0;

    const tick = (t: number) => {
      const minDt = 1000 / 30;

      if (t - lastMouthTickRef.current >= minDt) {
        lastMouthTickRef.current = t;

        setMouthFloat(() => {
          const time = Date.now() / 1000;
          const base = (Math.sin(time * 10) + 1) / 2;
          const jitter = (Math.random() - 0.5) * 0.14;
          const v = base * 0.72 + jitter;
          return Math.max(0, Math.min(1, v));
        });
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
  }

  function stopMouthAnim() {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    setMouthFloat(0);
  }

  function pushStudent(text: string) {
    setMsgs((prev) => [...prev, { id: uid(), role: "student", text }]);
  }

  function pushTutor(text: string) {
    setMsgs((prev) => [...prev, { id: uid(), role: "tutor", text }]);
  }

  function runTutorAnswer(question: string) {
    setStatus("thinking");

    if (thinkingTimeoutRef.current) window.clearTimeout(thinkingTimeoutRef.current);

    thinkingTimeoutRef.current = window.setTimeout(() => {
      const answer = pickMockAnswer(topic, question);
      pushTutor(answer);

      setStatus("speaking");

      speak(
        answer,
        () => startMouthAnim(),
        () => {
          stopMouthAnim();
          setStatus("idle");
        }
      );
    }, 500);
  }

  function send() {
    const text = input.trim();
    if (!text) return;
    if (status !== "idle") return;

    setInput("");
    pushStudent(text);
    runTutorAnswer(text);
  }

  const canSend = useMemo(() => input.trim().length > 0 && status === "idle", [input, status]);

  return (
    <div className="w-full overflow-hidden h-[calc(100vh-140px)] flex flex-col">
      <div className="px-4 pt-4 shrink-0">
        <PageHeader
          title="Tutor IA"
          subtitle="Avatar 2D + TTS"
          right={
            <select
              className="rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm"
              value={topic}
              onChange={(e) => setTopic(e.target.value as Topic)}
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          }
        />
      </div>

      <div className="flex-1 min-h-0 px-4 pb-4 pt-2">
        <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <section className="lg:col-span-3 h-full min-h-0 rounded-3xl border border-vp-border bg-vp-panel shadow-soft overflow-hidden flex flex-col">
            <div ref={stageRef} className="flex-1 min-h-[360px] lg:min-h-[520px] p-3 sm:p-4">
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-full aspect-[4/5] max-w-full">
                  <AvatarModel
                    mouthLevel={mouthLevel}
                    speaking={status === "speaking"}
                    size={avatarSize}
                    fit="contain"
                    zoom={1.06}
                    offsetX={0}
                    offsetY={10}
                    aspectRatio="4 / 5"
                    breatheScale={0.008}
                    breatheSeconds={4}
                    talkPixels={2}
                    talkSeconds={0.22}
                  />
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-vp-border px-4 py-2 flex items-center justify-between">
              <div className="text-sm font-semibold">Tutor IA</div>
              <div className="text-xs text-vp-muted">
                {status === "thinking" ? "Pensando..." : status === "speaking" ? "Hablando..." : "Listo"}
              </div>
            </div>
          </section>

          <section className="lg:col-span-1 h-full min-h-0 rounded-3xl border border-vp-border bg-vp-panel shadow-soft overflow-hidden flex flex-col">
            <div className="shrink-0 border-b border-vp-border px-4 py-2 flex items-center justify-between">
              <div className="text-sm font-semibold">Chat</div>
              <div className="text-xs text-vp-muted">
                {status === "thinking" ? "Pensando..." : status === "speaking" ? "Hablando..." : "Listo"}
              </div>
            </div>

            <div className="flex-1 min-h-0 p-3 space-y-3 overflow-y-auto">
              {msgs.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    m.role === "tutor" ? "bg-vp-soft/20 border-vp-border" : "bg-white border-vp-border"
                  }`}
                >
                  <div className="text-xs mb-1 text-vp-muted">{m.role === "tutor" ? "Tutor" : "Alumno"}</div>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="shrink-0 border-t border-vp-border p-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-2xl border border-vp-border bg-white px-4 py-3 text-sm"
                  placeholder={status === "idle" ? "Escribe tu pregunta…" : "Espera a que termine…"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      send();
                    }
                  }}
                  disabled={status !== "idle"}
                />
                <button
                  className="rounded-2xl bg-vp-primary px-5 py-3 text-sm text-white disabled:opacity-50"
                  onClick={send}
                  disabled={!canSend}
                >
                  Enviar
                </button>
              </div>

              {status !== "idle" && (
                <div className="mt-2 text-xs text-vp-muted">
                  El tutor está {status === "thinking" ? "pensando" : "hablando"}.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}