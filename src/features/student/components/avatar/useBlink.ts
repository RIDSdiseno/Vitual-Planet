import { useEffect, useRef, useState } from "react";

type BlinkOptions = {
  enabled?: boolean;
  intervalMs?: number; // promedio
  jitterMs?: number;   // variación
  blinkMs?: number;    // cuánto dura cerrado
};

export function useBlink({
  enabled = true,
  intervalMs = 3800,
  jitterMs = 1200,
  blinkMs = 140,
}: BlinkOptions = {}) {
  const [closed, setClosed] = useState(false);
  const tRef = useRef<number | null>(null);
  const closeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setClosed(false);
      return;
    }

    const schedule = () => {
      const jitter = Math.floor((Math.random() - 0.5) * 2 * jitterMs);
      const next = Math.max(900, intervalMs + jitter);

      tRef.current = window.setTimeout(() => {
        setClosed(true);
        closeRef.current = window.setTimeout(() => {
          setClosed(false);
          schedule();
        }, blinkMs);
      }, next);
    };

    schedule();

    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
      if (closeRef.current) window.clearTimeout(closeRef.current);
      tRef.current = null;
      closeRef.current = null;
    };
  }, [enabled, intervalMs, jitterMs, blinkMs]);

  return closed;
}