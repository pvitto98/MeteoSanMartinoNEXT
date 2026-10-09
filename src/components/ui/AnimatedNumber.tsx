import { useEffect, useRef, useState } from "react";
import { fmt } from "@/lib/format";

/** Counts smoothly to the new value whenever it changes. */
export function AnimatedNumber({ value, digits = 1, duration = 900 }: { value: number; digits?: number; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);
  const first = useRef(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Count up from a little below on first paint, then tick between readings.
    const start = first.current ? value - Math.max(3, Math.abs(value) * 0.25) : from.current;
    first.current = false;
    if (reduced || start === value) {
      setDisplay(value);
      from.current = value;
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - k, 4);
      setDisplay(start + (value - start) * eased);
      if (k < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{fmt(display, digits)}</>;
}
