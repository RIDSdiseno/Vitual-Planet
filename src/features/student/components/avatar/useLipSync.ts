import { useEffect, useRef, useState } from "react";

export type MouthLevel = 0 | 1 | 2;

type Thresholds = { low: number; mid: number };

export type LipSyncOptions = {
  enabled?: boolean;
  thresholds?: Thresholds;           // 0..1
  smoothingTimeConstant?: number;    // 0..1
  noiseGate?: number;               // 0..1
  maxFps?: number;                  // ej: 30
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function normalizeThresholds(t: Thresholds): Thresholds {
  const low = clamp01(t.low);
  const mid = clamp01(t.mid);
  if (low >= mid) return { low: Math.max(0, mid - 0.01), mid };
  return { low, mid };
}

function computeRms(data: Uint8Array) {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const v = (data[i] - 128) / 128; // -1..1
    sum += v * v;
  }
  return Math.sqrt(sum / data.length);
}

/**
 * ✅ Recomendado:
 * Usa un HTMLAudioElement real (audioRef.current)
 */
export function useLipSyncFromAudio(
  audioEl: HTMLAudioElement | null,
  opts?: LipSyncOptions
) {
  const enabled = opts?.enabled ?? true;
  const thresholds = normalizeThresholds(opts?.thresholds ?? { low: 0.02, mid: 0.05 });
  const smoothingTimeConstant = opts?.smoothingTimeConstant ?? 0.8;
  const noiseGate = clamp01(opts?.noiseGate ?? 0.01);
  const maxFps = opts?.maxFps;

  const [mouthLevel, setMouthLevel] = useState<MouthLevel>(0);

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const srcRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const cleanup = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;

      try { srcRef.current?.disconnect(); } catch {}
      try { analyserRef.current?.disconnect(); } catch {}

      srcRef.current = null;
      analyserRef.current = null;
      dataRef.current = null;

      try { ctxRef.current?.close(); } catch {}
      ctxRef.current = null;

      setMouthLevel(0);
    };

    if (!audioEl || !enabled) {
      cleanup();
      return;
    }

    const ACtx =
      (window.AudioContext || (window as any).webkitAudioContext) as
        | typeof AudioContext
        | undefined;

    if (!ACtx) {
      setMouthLevel(0);
      return;
    }

    const ctx = new ACtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = smoothingTimeConstant;

    const src = ctx.createMediaElementSource(audioEl);
    src.connect(analyser);
    analyser.connect(ctx.destination);

    const data = new Uint8Array(analyser.fftSize);

    ctxRef.current = ctx;
    analyserRef.current = analyser;
    srcRef.current = src;
    dataRef.current = data;

    const levelNow = (): MouthLevel => {
      analyser.getByteTimeDomainData(data);
      const rms = computeRms(data);

      if (rms < noiseGate) return 0;
      if (rms >= thresholds.mid) return 2;
      if (rms >= thresholds.low) return 1;
      return 0;
    };

    const loop = (t: number) => {
      if (maxFps) {
        const minDt = 1000 / maxFps;
        if (t - lastTickRef.current < minDt) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }
        lastTickRef.current = t;
      }

      setMouthLevel(levelNow());

      if (!audioEl.paused && !audioEl.ended) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        rafRef.current = null;
        setMouthLevel(0);
      }
    };

    const onPlay = async () => {
      if (ctx.state !== "running") {
        try { await ctx.resume(); } catch {}
      }
      if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
    };

    const onPauseOrEnd = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setMouthLevel(0);
    };

    audioEl.addEventListener("play", onPlay);
    audioEl.addEventListener("pause", onPauseOrEnd);
    audioEl.addEventListener("ended", onPauseOrEnd);

    if (!audioEl.paused && !audioEl.ended) onPlay();

    return () => {
      audioEl.removeEventListener("play", onPlay);
      audioEl.removeEventListener("pause", onPauseOrEnd);
      audioEl.removeEventListener("ended", onPauseOrEnd);
      cleanup();
    };
  }, [
    audioEl,
    enabled,
    thresholds.low,
    thresholds.mid,
    smoothingTimeConstant,
    noiseGate,
    maxFps,
  ]);

  return mouthLevel;
}

/**
 * Opcional:
 * Si tienes un URL de audio y quieres que el hook cree el Audio internamente.
 * Útil para pruebas, pero para tu app es mejor usar useLipSyncFromAudio con un <audio ref>.
 */
export function useLipSyncFromUrl(audioUrl?: string, enabled?: boolean) {
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl || !enabled) {
      setAudioEl(null);
      return;
    }
    const a = new Audio(audioUrl);
    setAudioEl(a);
    return () => {
      try { a.pause(); } catch {}
      setAudioEl(null);
    };
  }, [audioUrl, enabled]);

  // Nota: esto analizará el audio si lo reproduces (a.play()) desde fuera o aquí.
  return useLipSyncFromAudio(audioEl, { enabled: !!audioUrl && !!enabled });
}

// Default export (para import sin llaves si quieres)
export default useLipSyncFromAudio;