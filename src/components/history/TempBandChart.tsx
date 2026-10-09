import { useState } from "react";
import { fmt, tempColor } from "@/lib/format";
import type { Bucket } from "@/lib/archive";
import { scale, smoothPath, type Pt } from "@/components/charts/path";
import { useWidth } from "@/components/charts/useWidth";
import styles from "./HistoryCharts.module.css";

const H = 190;
const PAD = { top: 16, bottom: 22, left: 26, right: 4 };

/** Daily (or monthly) min–max bars coloured by temperature, with the mean as a smooth line. */
export function TempBandChart({ buckets, onSelect }: { buckets: Bucket[]; onSelect?: (b: Bucket) => void }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  if (!buckets.length) return null;

  const lo = Math.floor(Math.min(...buckets.map((b) => b.low)) / 5) * 5;
  const hi = Math.ceil(Math.max(...buckets.map((b) => b.high)) / 5) * 5;
  const y = scale(lo, hi, H - PAD.bottom, PAD.top);
  const step = (width - PAD.left - PAD.right) / buckets.length;
  const barW = Math.max(3, Math.min(14, step * 0.55));
  const cx = (i: number) => PAD.left + step * i + step / 2;
  const avg: Pt[] = buckets.map((b, i) => [cx(i), y(b.avg)]);
  const gridLines = Array.from({ length: Math.round((hi - lo) / 5) + 1 }, (_, i) => lo + i * 5);
  const labelEvery = Math.ceil(buckets.length / 8);
  const sel = active !== null ? buckets[active] : null;

  const pick = (e: React.PointerEvent<SVGSVGElement>) => {
    const x = e.clientX - e.currentTarget.getBoundingClientRect().left;
    const i = Math.max(0, Math.min(buckets.length - 1, Math.floor((x - PAD.left) / step)));
    setActive(i);
  };

  return (
    <div ref={ref} className={styles.wrap}>
      <div className={styles.readout} aria-live="polite">
        {sel ? (
          <>
            <strong>{sel.days.length === 1 ? `${sel.label} ` : sel.label}</strong>
            <span className="tabular">
              min <b style={{ color: tempColor(sel.low) }}>{fmt(sel.low)}°</b> · media {fmt(sel.avg)}° · max{" "}
              <b style={{ color: tempColor(sel.high) }}>{fmt(sel.high)}°</b>
            </span>
            {onSelect && sel.days.length === 1 && (
              <button className={styles.link} onClick={() => onSelect(sel)}>
                dettagli
              </button>
            )}
          </>
        ) : (
          <span className={styles.hint}>Tocca o trascina sul grafico</span>
        )}
      </div>
      <svg
        width={width}
        height={H}
        className={styles.svg}
        onPointerDown={pick}
        onPointerMove={(e) => e.buttons || e.pointerType === "mouse" ? pick(e) : undefined}
        role="img"
        aria-label="Temperature minime, medie e massime"
      >
        {gridLines.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className={styles.grid} />
            <text x={PAD.left - 6} y={y(t) + 4} className={styles.yTick}>
              {t}°
            </text>
          </g>
        ))}
        {buckets.map((b, i) => (
          <g key={b.key} opacity={active === null || active === i ? 1 : 0.45}>
            <defs>
              <linearGradient id={`band-${b.key}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={tempColor(b.high)} />
                <stop offset="1" stopColor={tempColor(b.low)} />
              </linearGradient>
            </defs>
            <rect
              x={cx(i) - barW / 2}
              y={y(b.high)}
              width={barW}
              height={Math.max(2, y(b.low) - y(b.high))}
              rx={barW / 2}
              fill={`url(#band-${b.key})`}
              className={styles.band}
              style={{ animationDelay: `${i * 12}ms` }}
            />
            {i % labelEvery === 0 && (
              <text x={cx(i)} y={H - 6} className={styles.xTick}>
                {b.label}
              </text>
            )}
          </g>
        ))}
        <path d={smoothPath(avg)} className={styles.avg} />
        {sel && <line x1={cx(active!)} x2={cx(active!)} y1={PAD.top - 6} y2={H - PAD.bottom} className={styles.cursor} />}
      </svg>
    </div>
  );
}
