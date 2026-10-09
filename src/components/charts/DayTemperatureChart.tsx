import { useId, useMemo, useState } from "react";
import { fmt, formatTime } from "@/lib/format";
import type { SeriesPoint } from "@/lib/types";
import { downsample, scale, smoothPath, type Pt } from "./path";
import { TempGradient } from "./TempGradient";
import { useWidth } from "./useWidth";
import styles from "./DayTemperatureChart.module.css";

interface Props {
  measured: SeriesPoint[];
  /** Model forecast for the rest of the day, drawn dashed after "now". */
  forecast: SeriesPoint[];
  dayStart: number;
  dayEnd: number;
  height?: number;
}

const PAD = { top: 26, bottom: 22, x: 4 };

/** Today's temperature: measured line, forecast continuation, min/max pins and touch scrubbing. */
export function DayTemperatureChart({ measured, forecast, dayStart, dayEnd, height = 150 }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<SeriesPoint & { forecast: boolean } | null>(null);

  const geo = useMemo(() => {
    const m = downsample(measured, 160);
    const lastT = m.at(-1)?.t ?? dayStart;
    const f = forecast.filter((p) => p.t > lastT && p.t <= dayEnd);
    const all = [...m, ...f];
    const values = all.map((p) => p.v);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(1, (max - min) * 0.15);
    const x = scale(dayStart, dayEnd, PAD.x, width - PAD.x);
    const y = scale(min - pad, max + pad, height - PAD.bottom, PAD.top);
    const mPts: Pt[] = m.map((p) => [x(p.t), y(p.v)]);
    const fPts: Pt[] = (m.length ? [m[m.length - 1], ...f] : f).map((p) => [x(p.t), y(p.v)]);
    const hi = m.reduce((a, b) => (b.v > a.v ? b : a), m[0] ?? { t: 0, v: 0 });
    const lo = m.reduce((a, b) => (b.v < a.v ? b : a), m[0] ?? { t: 0, v: 0 });
    return { m, f, x, y, mPts, fPts, hi, lo, min: min - pad, max: max + pad };
  }, [measured, forecast, dayStart, dayEnd, width, height]);

  if (!geo.m.length) return <div ref={ref} className="skeleton" style={{ height }} />;

  const linePath = smoothPath(geo.mPts);
  const areaPath = `${linePath}L${geo.mPts.at(-1)![0]},${height - PAD.bottom}L${geo.mPts[0][0]},${height - PAD.bottom}Z`;
  const now = geo.mPts.at(-1)!;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = dayStart + ((e.clientX - rect.left - PAD.x) / (width - 2 * PAD.x)) * (dayEnd - dayStart);
    const pool = [...geo.m.map((p) => ({ ...p, forecast: false })), ...geo.f.map((p) => ({ ...p, forecast: true }))];
    let best = pool[0];
    for (const p of pool) if (Math.abs(p.t - t) < Math.abs(best.t - t)) best = p;
    setHover(best);
  };

  const ticks = [6, 12, 18].map((h) => dayStart + h * 3600_000);

  return (
    <div ref={ref} className={styles.wrap}>
      <svg
        width={width}
        height={height}
        className={styles.svg}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Temperatura di oggi: minima ${fmt(geo.lo.v)}°, massima ${fmt(geo.hi.v)}°`}
      >
        <defs>
          <TempGradient id={`line${gid}`} yOf={geo.y} min={geo.min} max={geo.max} />
          <TempGradient id={`area${gid}`} yOf={geo.y} min={geo.min} max={geo.max} opacity={0.35} />
          <linearGradient id={`fade${gid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={`mask${gid}`}>
            <rect x="0" y="0" width={width} height={height} fill={`url(#fade${gid})`} />
          </mask>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={geo.x(t)} x2={geo.x(t)} y1={PAD.top - 8} y2={height - PAD.bottom} className={styles.grid} />
            <text x={geo.x(t)} y={height - 6} className={styles.tick}>
              {formatTime(t).slice(0, 2)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#area${gid})`} mask={`url(#mask${gid})`} />
        <path d={smoothPath(geo.fPts)} className={styles.forecast} stroke={`url(#line${gid})`} />
        <path d={linePath} className={styles.line} stroke={`url(#line${gid})`} />

        {[
          { p: geo.hi, label: "max" },
          { p: geo.lo, label: "min" },
        ].map(({ p, label }) => (
          <g key={label} transform={`translate(${geo.x(p.t)},${geo.y(p.v)})`}>
            <circle r="3.5" className={styles.pin} />
            <text y={label === "max" ? -10 : 18} className={styles.pinLabel}>
              {fmt(p.v)}°
            </text>
          </g>
        ))}

        <circle cx={now[0]} cy={now[1]} r="9" className={styles.nowHalo} />
        <circle cx={now[0]} cy={now[1]} r="4.5" className={styles.now} />

        {hover && (
          <g transform={`translate(${geo.x(hover.t)},0)`}>
            <line y1={PAD.top - 6} y2={height - PAD.bottom} className={styles.cursor} />
            <circle cy={geo.y(hover.v)} r="4" className={styles.now} />
          </g>
        )}
      </svg>
      {hover && (
        <div className={styles.tooltip} style={{ left: Math.min(Math.max(geo.x(hover.t), 50), width - 50) }}>
          <strong className="tabular">{fmt(hover.v)}°</strong>
          <span>
            {formatTime(hover.t)}
            {hover.forecast ? " · previsto" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
