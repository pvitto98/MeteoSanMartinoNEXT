import { fmt } from "@/lib/format";
import type { Bucket } from "@/lib/archive";
import { scale } from "@/components/charts/path";
import { useWidth } from "@/components/charts/useWidth";
import styles from "./HistoryCharts.module.css";

const H = 130;
const PAD = { top: 18, bottom: 22, left: 4, right: 4 };

/** Rain per day or month with a running total line. */
export function RainBars({ buckets }: { buckets: Bucket[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  if (!buckets.length) return null;
  const total = buckets.reduce((s, b) => s + b.rain, 0);
  const peak = Math.max(1, ...buckets.map((b) => b.rain));
  const y = scale(0, peak, H - PAD.bottom, PAD.top);
  const yc = scale(0, Math.max(total, 1), H - PAD.bottom, PAD.top);
  const step = (width - PAD.left - PAD.right) / buckets.length;
  const barW = Math.max(2, step * 0.6);
  const labelEvery = Math.ceil(buckets.length / 8);
  let running = 0;
  const cumulative = buckets
    .map((b, i) => {
      running += b.rain;
      return `${i ? "L" : "M"}${(PAD.left + step * i + step / 2).toFixed(1)},${yc(running).toFixed(1)}`;
    })
    .join("");
  const wettest = buckets.reduce((a, b) => (b.rain > a.rain ? b : a), buckets[0]);

  return (
    <div ref={ref} className={styles.wrap}>
      <svg width={width} height={H} className={styles.svg} role="img" aria-label={`Pioggia totale ${fmt(total)} mm`}>
        <path d={cumulative} className={styles.cumulative} />
        {buckets.map((b, i) => (
          <g key={b.key}>
            {b.rain > 0 && (
              <rect
                x={PAD.left + step * i + (step - barW) / 2}
                y={y(b.rain)}
                width={barW}
                height={H - PAD.bottom - y(b.rain)}
                rx={Math.min(3, barW / 2)}
                className={styles.rainBar}
              />
            )}
            {b === wettest && b.rain > 0 && (
              <text x={PAD.left + step * i + step / 2} y={y(b.rain) - 5} className={styles.barLabel}>
                {fmt(b.rain, 0)}
              </text>
            )}
            {i % labelEvery === 0 && (
              <text x={PAD.left + step * i + step / 2} y={H - 6} className={styles.xTick}>
                {b.label}
              </text>
            )}
          </g>
        ))}
        <line x1={PAD.left} x2={width - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} className={styles.grid} />
      </svg>
      <div className={styles.legend}>
        <span>
          <i className={styles.legendBar} /> mm caduti
        </span>
        <span>
          <i className={styles.legendLine} /> cumulata ({fmt(total)} mm)
        </span>
      </div>
    </div>
  );
}
