import { useEffect, useRef, useState } from "react";
import * as SunCalc from "suncalc";
import { STATION } from "@/lib/config";
import { clamp } from "@/lib/format";
import { usePrefersReducedMotion, useScene } from "@/lib/hooks";
import styles from "./SkyBackground.module.css";

type Particle = { x: number; y: number; z: number; s: number; p: number };

export const SKY_STORAGE_KEY = "msm.sky";

/**
 * The page background is the sky above the station right now: colours follow
 * the real sun altitude and the measured cloudiness; stars, rain and snow are
 * drawn on a canvas from the live readings.
 */
export function SkyBackground() {
  const { palette, condition } = useScene();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  // Sun position depends on the client clock: render the glow after hydration only.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cloudiness = condition?.cloudiness ?? 0.3;
  const rainRate = condition?.rainRate ?? 0;
  const snowing = condition?.kind === "snow";
  const starVisibility = clamp((1 - palette.daylight * 1.6) * (1 - cloudiness * 1.1), 0, 1);

  // Paint the sky into CSS variables so every surface can pick it up.
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--sky-top", palette.top);
    root.setProperty("--sky-bottom", palette.bottom);
    root.setProperty("--sky-glow", palette.glow);
    root.setProperty("--daylight", palette.daylight.toFixed(2));
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", palette.theme);
    // Remember the real sky so the next visit paints it before any data arrives (see _document).
    if (condition) {
      try {
        localStorage.setItem(SKY_STORAGE_KEY, JSON.stringify({ top: palette.top, bottom: palette.bottom, glow: palette.glow, at: Date.now() }));
      } catch {
        /* storage unavailable: the default sky is used on the next visit */
      }
    }
  }, [palette, condition]);

  // Position the sun/moon glow from the real azimuth and altitude.
  const date = new Date();
  const sun = SunCalc.getPosition(date, STATION.lat, STATION.lon);
  const body = palette.daylight > 0.15 ? sun : SunCalc.getMoonPosition(date, STATION.lat, STATION.lon);
  // Azimuth is clockwise from north: east (90°) on the left, south in the middle, west (270°) on the right.
  const glowX = clamp(50 + ((body.azimuth - 180) / 180) * 90, 8, 92);
  const glowY = clamp(32 - body.altitude, 4, 60);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    const stars: Particle[] = Array.from({ length: Math.round(starVisibility * 140) }, () => ({
      x: Math.random(),
      y: Math.random() * 0.75,
      z: rand(0.3, 1),
      s: rand(0.4, 1.4),
      p: Math.random() * Math.PI * 2,
    }));
    const dropCount = snowing ? 90 : Math.round(clamp(rainRate / 10, 0.15, 1) * 220) * (rainRate > 0 ? 1 : 0);
    const drops: Particle[] = Array.from({ length: dropCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: rand(0.4, 1),
      s: rand(0.6, 1),
      p: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, width, height);

      for (const st of stars) {
        const twinkle = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(now / 900 + st.p);
        ctx.globalAlpha = starVisibility * st.z * twinkle;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(st.x * width, st.y * height, st.s, 0, Math.PI * 2);
        ctx.fill();
      }

      if (drops.length) {
        ctx.lineCap = "round";
        for (const d of drops) {
          if (!reduced) {
            d.y += (snowing ? 0.06 : 1.1) * d.z * dt * (snowing ? 1 : 1.4);
            d.x += snowing ? Math.sin(now / 1200 + d.p) * 0.0006 : -0.05 * dt;
            if (d.y > 1.05) {
              d.y = -0.05;
              d.x = Math.random() * 1.1;
            }
          }
          const x = d.x * width;
          const y = d.y * height;
          if (snowing) {
            ctx.globalAlpha = 0.75 * d.z;
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(x, y, 1.6 * d.s * d.z + 0.6, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.globalAlpha = 0.35 * d.z;
            ctx.strokeStyle = "#cfe8ff";
            ctx.lineWidth = d.z * 1.3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 2 * d.z, y + 16 * d.z);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      if (!reduced) frame = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [starVisibility, rainRate, snowing, reduced]);

  const cloudOpacity = clamp(cloudiness * 0.9, 0, 0.75);

  return (
    <div className={styles.sky} aria-hidden="true">
      <div className={styles.gradient} />
      {mounted && (
        <div
        className={styles.glow}
        style={{ left: `${glowX}%`, top: `${glowY}%`, opacity: clamp(0.25 + palette.daylight * 0.6 - cloudiness * 0.5, 0.12, 0.85) }}
        />
      )}
      <div className={styles.clouds} style={{ opacity: cloudOpacity }}>
        <span className={styles.c1} />
        <span className={styles.c2} />
        <span className={styles.c3} />
        <span className={styles.c4} />
      </div>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.vignette} />
    </div>
  );
}
