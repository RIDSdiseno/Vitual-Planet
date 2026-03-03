import React, { useEffect, useMemo, useRef, useState } from "react";
import { useBlink } from "./useBlink";

type FitMode = "contain" | "cover";

export type Props = {
  speaking: boolean;

  /**
   * En vez de “tamaño fijo”, acá interpretamos size como “hint”.
   * El avatar se ajusta al contenedor con width:100% + height:100%.
   * Si no pasas size, igual se adapta.
   */
  size?: number;

  /** Por compatibilidad: ya NO limitamos tan agresivo (antes era 360) */
  maxSize?: number;

  className?: string;
  style?: React.CSSProperties;

  /**
   * ✅ NUEVO: mouthLevel externo (0 cerrada, 1 media, 2 abierta)
   * Si viene, lo usamos SOLO para la boca.
   * Si NO viene, se mantiene tu animación interna intacta.
   */
  mouthLevel?: 0 | 1 | 2;

  /**
   * ✅ NUEVOS: props de compatibilidad con StudentTutorPage
   * No se aplican a estilos aquí para NO cambiar el avatar.
   */
  fit?: FitMode;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
  aspectRatio?: string;
  breatheScale?: number;
  breatheSeconds?: number;
  talkPixels?: number;
  talkSeconds?: number;
};

/**
 * AvatarSimple (2D) ajustado para “encajar bien” en un contenedor grande:
 * - Ocupa todo el espacio disponible (width/height 100%)
 * - Mantiene ratio para “torso para arriba” (4/5)
 * - Escala el contenido dentro del card (scale) para aprovechar el panel
 * - Centrado real y sin verse como mini sticker
 */
export default function AvatarSimple({
  speaking,
  size,
  maxSize,
  className,
  style,

  // compat props (no alteran layout)
  mouthLevel: mouthLevelExternal,
  fit: _fit,
  zoom: _zoom,
  offsetX: _offsetX,
  offsetY: _offsetY,
  aspectRatio: _aspectRatio,
  breatheScale: _breatheScale,
  breatheSeconds: _breatheSeconds,
  talkPixels: _talkPixels,
  talkSeconds: _talkSeconds,
}: Props) {
  const eyesClosed = useBlink({
    enabled: true,
    intervalMs: 3200,
    jitterMs: 1400,
    blinkMs: 120,
  });

  // Boca: 0 cerrada, 1 media, 2 abierta, 3 sonrisa
  const [mouthLevel, setMouthLevel] = useState<0 | 1 | 2 | 3>(0);
  const mouthTimer = useRef<number | null>(null);

  useEffect(() => {
    // ✅ Si nos pasan mouthLevel desde afuera, NO tocamos tu animación.
    // Solo dejamos el state interno libre (puede quedar como estaba).
    if (typeof mouthLevelExternal === "number") {
      // no iniciar intervalos ni cambiar tu secuencia
      if (mouthTimer.current) window.clearInterval(mouthTimer.current);
      mouthTimer.current = null;
      return;
    }

    // ✅ comportamiento original intacto
    if (!speaking) {
      setMouthLevel(3);
      if (mouthTimer.current) window.clearInterval(mouthTimer.current);
      mouthTimer.current = null;
      return;
    }

    const seq: (0 | 1 | 2 | 3)[] = [1, 2, 1, 0, 1, 2, 1, 3, 1, 2, 0];
    let i = 0;

    if (mouthTimer.current) window.clearInterval(mouthTimer.current);
    mouthTimer.current = window.setInterval(() => {
      setMouthLevel(seq[i] ?? 0);
      i = (i + 1) % seq.length;
    }, 85);

    return () => {
      if (mouthTimer.current) window.clearInterval(mouthTimer.current);
      mouthTimer.current = null;
    };
  }, [speaking, mouthLevelExternal]);

  const css = useMemo(
    () => `
@keyframes breathe {
  0%   { transform: translateY(0px) scale(1); }
  50%  { transform: translateY(-2px) scale(1.01); }
  100% { transform: translateY(0px) scale(1); }
}
@keyframes headTalk {
  0%   { transform: translateY(0px) rotate(0deg); }
  50%  { transform: translateY(-2px) rotate(-0.5deg); }
  100% { transform: translateY(0px) rotate(0.5deg); }
}
@keyframes floaty {
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-3px); }
  100% { transform: translateY(0px); }
}
@keyframes hairShine {
  0% { opacity: .08; transform: translateX(-14%) rotate(-10deg); }
  50% { opacity: .16; transform: translateX(14%) rotate(-10deg); }
  100% { opacity: .08; transform: translateX(-14%) rotate(-10deg); }
}
@keyframes blinkLine {
  0% { transform: scaleX(1); opacity: .9; }
  50% { transform: scaleX(.86); opacity: .95; }
  100% { transform: scaleX(1); opacity: .9; }
}
@keyframes sparkle {
  0% { transform: translateY(0) scale(1); opacity: .85; }
  50% { transform: translateY(-1px) scale(1.06); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: .85; }
}
`,
    []
  );

  // ✅ Boca efectiva: si viene mouthLevel externo, mapeamos 0|1|2 a tu sistema 0|1|2|3
  const effectiveMouthLevel: 0 | 1 | 2 | 3 =
    typeof mouthLevelExternal === "number"
      ? (mouthLevelExternal as 0 | 1 | 2)
      : mouthLevel;

  const mouth = getAnimeMouthStyle(effectiveMouthLevel, speaking);

  /**
   * Escala del contenido:
   * - si el contenedor es grande, se ve “mini” si dejamos 1:1.
   * - con scale subimos el “zoom” del dibujo dentro de la card.
   * - size (si viene) actúa como pista, pero no obliga.
   */
  const contentScale = (() => {
    // base: agradable por defecto en panel grande
    let s = 1.18;

    if (typeof size === "number") {
      // si te pasan size grande, sube un poco para llenar mejor
      if (size >= 520) s = 1.26;
      else if (size >= 420) s = 1.22;
      else if (size >= 340) s = 1.18;
      else s = 1.12;
    }

    // si te pasan maxSize, úsalo como “techo suave” (no como clamp agresivo)
    if (typeof maxSize === "number") {
      if (maxSize <= 340) s = Math.min(s, 1.10);
      if (maxSize <= 420) s = Math.min(s, 1.16);
    }

    return s;
  })();

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        ...style,
      }}
    >
      <style>{css}</style>

      {/* Card que ocupa TODO el contenedor y mantiene ratio torso */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",

          // clave: el contenedor externo (tu AvatarModel) ya controla el ratio.
          // aquí no lo forzamos a 16/10, porque eso achica.
          // Si igual lo usas standalone, esto ayuda:
          aspectRatio: "4 / 5",

          borderRadius: 28,
          background: "linear-gradient(180deg, #ffffff 0%, #f6f7fb 100%)",
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow: "0 18px 60px rgba(15,23,42,0.10)",
          overflow: "hidden",

          // menos padding para que el dibujo crezca
          padding: 10,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Fondo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 30% 20%, rgba(99,102,241,0.10), transparent 55%), radial-gradient(circle at 70% 80%, rgba(236,72,153,0.10), transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* Glow cuando habla */}
        {speaking && (
          <div
            style={{
              position: "absolute",
              inset: -80,
              background:
                "radial-gradient(circle at 50% 65%, rgba(99,102,241,0.16), transparent 62%)",
              pointerEvents: "none",
              filter: "blur(0.2px)",
            }}
          />
        )}

        {/* Shine */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -100,
            width: 320,
            height: 320,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(255,255,255,0.6), transparent 65%)",
            transform: "rotate(-18deg)",
            opacity: 0.28,
            pointerEvents: "none",
          }}
        />

        {/* Wrapper del dibujo: se escala para llenar el panel */}
        <div
          style={{
            width: "100%",
            height: "100%",
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            // El truco para que no quede “mini”:
            transform: `scale(${contentScale}) translateY(6%)`,
            transformOrigin: "50% 55%",
            animation: `breathe 4s ease-in-out infinite`,
          }}
        >
          {/* Avatar (cabeza + cuello + torso) */}
          <div
            style={{
              width: "70%",
              // altura menor que 100% para evitar cortes al escalar
              height: "70%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              transformOrigin: "50% 70%",
              animation: speaking
                ? `headTalk 0.26s ease-in-out infinite alternate`
                : "floaty 5.2s ease-in-out infinite",
            }}
          >
            {/* Cabeza */}
            <div
              style={{
                width: "86%",
                aspectRatio: "1 / 1",
                borderRadius: 999,
                position: "relative",
                background: "linear-gradient(180deg, #ffe9e0, #ffd0c2)",
                boxShadow:
                  "inset 0 -14px 28px rgba(0,0,0,0.07), 0 14px 28px rgba(0,0,0,0.06)",
                border: "1px solid rgba(15,23,42,0.05)",
              }}
            >
              {/* Lineart */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)",
                  pointerEvents: "none",
                }}
              />

              {/* Sombra lateral */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  background:
                    "radial-gradient(circle at 16% 58%, rgba(0,0,0,0.07), transparent 56%)",
                  pointerEvents: "none",
                }}
              />

              {/* Pelo base */}
              <div
                style={{
                  position: "absolute",
                  top: "-16%",
                  left: "-12%",
                  right: "-12%",
                  height: "70%",
                  borderRadius: "999px 999px 190px 190px",
                  background: "linear-gradient(180deg, #2f232a, #161015)",
                  boxShadow: "0 16px 30px rgba(0,0,0,0.24)",
                }}
              />

              {/* Capas de pelo */}
              <div
                style={{
                  position: "absolute",
                  top: "6%",
                  left: "2%",
                  right: "2%",
                  height: "44%",
                  borderRadius: "999px 999px 160px 160px",
                  background:
                    "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.04), transparent)",
                  pointerEvents: "none",
                }}
              />

              {/* Brillo pelo */}
              <div
                style={{
                  position: "absolute",
                  top: "-10%",
                  left: "8%",
                  width: "60%",
                  height: "56%",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.0), rgba(255,255,255,0.26), rgba(255,255,255,0.0))",
                  transform: "rotate(-10deg)",
                  animation: "hairShine 4.2s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />

              {/* Flequillo */}
              <HairStrand x="14%" w="20%" h="40%" r="54px" />
              <HairStrand x="33%" w="18%" h="44%" r="58px" />
              <HairStrand x="51%" w="18%" h="42%" r="56px" />
              <HairStrand x="69%" w="16%" h="36%" r="48px" />

              {/* Cejas */}
              <div
                style={{
                  position: "absolute",
                  top: "35%",
                  left: "16%",
                  right: "16%",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <AnimeBrow flip={false} />
                <AnimeBrow flip />
              </div>

              {/* Ojos */}
              <div
                style={{
                  position: "absolute",
                  top: "42%",
                  left: "12%",
                  right: "12%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <AnimeEye closed={eyesClosed} speaking={speaking} />
                <AnimeEye closed={eyesClosed} speaking={speaking} />
              </div>

              {/* Nariz */}
              <div
                style={{
                  position: "absolute",
                  top: "58%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 14,
                  height: 9,
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.06)",
                  filter: "blur(0.2px)",
                }}
              />

              {/* Boca */}
              <div
                style={{
                  position: "absolute",
                  top: "67%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "28%",
                  ...mouth,
                }}
              />

              {/* Mejillas */}
              <Cheek left strong={speaking} />
              <Cheek strong={speaking} />
            </div>

            {/* Cuello */}
            <div
              style={{
                width: "20%",
                height: 24,
                borderRadius: 999,
                background: "linear-gradient(180deg, #ffd8c9, #ffc8b6)",
                boxShadow: "inset 0 -10px 18px rgba(0,0,0,0.06)",
                marginTop: -6,
              }}
            />

            {/* Torso */}
            <div
              style={{
                width: "100%",
                height: "44%",
                borderRadius: 26,
                background: "linear-gradient(180deg, #0f172a, #070a16)",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 22px 45px rgba(0,0,0,0.14)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Camisa */}
              <div
                style={{
                  position: "absolute",
                  inset: 14,
                  borderRadius: 22,
                  background: "linear-gradient(180deg, #ffffff, #f1f5f9)",
                  boxShadow: "inset 0 -10px 18px rgba(0,0,0,0.05)",
                }}
              />

              {/* Solapas */}
              <div
                style={{
                  position: "absolute",
                  top: 22,
                  left: 26,
                  width: 66,
                  height: 86,
                  borderRadius: 18,
                  background: "rgba(15,23,42,0.06)",
                  transform: "skewY(10deg)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 22,
                  right: 26,
                  width: 66,
                  height: 86,
                  borderRadius: 18,
                  background: "rgba(15,23,42,0.06)",
                  transform: "skewY(-10deg)",
                }}
              />

              {/* Corbata */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 20,
                  height: 92,
                  borderRadius: 999,
                  background: "linear-gradient(180deg, #fb7185, #be123c)",
                  boxShadow: "0 10px 20px rgba(190,18,60,0.22)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 30,
                  height: 22,
                  borderRadius: 999,
                  background: "linear-gradient(180deg, #fb7185, #e11d48)",
                }}
              />

              {/* Shine */}
              <div
                style={{
                  position: "absolute",
                  top: -60,
                  right: -80,
                  width: 220,
                  height: 220,
                  borderRadius: 999,
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)",
                  transform: "rotate(18deg)",
                  opacity: 0.22,
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HairStrand({ x, w, h, r }: { x: string; w: string; h: string; r: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "8%",
        left: x,
        width: w,
        height: h,
        borderRadius: `0 0 ${r} ${r}`,
        background: "rgba(0,0,0,0.18)",
        filter: "blur(0.15px)",
      }}
    />
  );
}

function AnimeBrow({ flip }: { flip: boolean }) {
  return (
    <div
      style={{
        width: 40,
        height: 6,
        borderRadius: 999,
        background: "rgba(15,23,42,0.42)",
        transform: flip ? "rotate(8deg)" : "rotate(-8deg)",
      }}
    />
  );
}

function AnimeEye({ closed, speaking }: { closed: boolean; speaking: boolean }) {
  if (closed) {
    return (
      <div style={{ width: 64, height: 20, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 6,
            right: 6,
            top: 9,
            height: 6,
            borderRadius: 999,
            background: "#0f172a",
            opacity: 0.88,
            animation: "blinkLine 120ms ease-in-out",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: 64,
        height: 40,
        borderRadius: 999,
        background: "#0b1224",
        position: "relative",
        boxShadow:
          "inset 0 -9px 0 rgba(255,255,255,0.10), 0 10px 18px rgba(0,0,0,0.10)",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 7,
          left: 20,
          width: 22,
          height: 22,
          borderRadius: 999,
          background:
            "radial-gradient(circle at 30% 30%, rgba(147,197,253,1), rgba(37,99,235,0.92) 70%)",
          opacity: 0.95,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 14,
          left: 28,
          width: 8,
          height: 10,
          borderRadius: 999,
          background: "rgba(10,10,10,0.55)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 9,
          left: 30,
          width: 7,
          height: 7,
          borderRadius: 999,
          background: "rgba(255,255,255,0.92)",
          animation: speaking ? "sparkle 600ms ease-in-out infinite" : undefined,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 24,
          width: 4,
          height: 4,
          borderRadius: 999,
          background: "rgba(255,255,255,0.70)",
          opacity: 0.9,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: -6,
          left: -12,
          right: -12,
          height: 20,
          borderRadius: 999,
          background: "rgba(255,255,255,0.06)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -2,
          height: 16,
          background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.06))",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function Cheek({ left, strong }: { left?: boolean; strong?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "62%",
        left: left ? "10%" : undefined,
        right: left ? undefined : "10%",
        width: 24,
        height: 12,
        borderRadius: 999,
        background: strong ? "rgba(255,105,180,0.24)" : "rgba(255,105,180,0.18)",
        filter: "blur(0.35px)",
      }}
    />
  );
}

function getAnimeMouthStyle(level: 0 | 1 | 2 | 3, speaking: boolean): React.CSSProperties {
  if (level === 0) {
    return {
      height: 9,
      borderRadius: 999,
      background: "rgba(15,23,42,0.86)",
      boxShadow: "inset 0 -2px 0 rgba(255,255,255,0.12)",
    };
  }
  if (level === 1) {
    return {
      height: 14,
      borderRadius: 14,
      background:
        "linear-gradient(180deg, rgba(15,23,42,0.90), rgba(15,23,42,0.96))",
      boxShadow: "inset 0 3px 0 rgba(255,255,255,0.10)",
    };
  }
  if (level === 2) {
    return {
      height: 20,
      borderRadius: 16,
      background:
        "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(15,23,42,0.98))",
      boxShadow:
        "inset 0 6px 0 rgba(255,255,255,0.08), inset 0 -9px 0 rgba(251,113,133,0.25)",
    };
  }

  return {
    height: 12,
    borderRadius: 999,
    background: "rgba(15,23,42,0.86)",
    boxShadow: speaking
      ? "inset 0 -2px 0 rgba(255,255,255,0.10)"
      : "inset 0 -2px 0 rgba(255,255,255,0.12)",
    clipPath: "ellipse(70% 46% at 50% 42%)",
  };
}