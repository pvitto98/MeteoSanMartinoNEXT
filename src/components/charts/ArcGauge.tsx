import { clamp } from "@/lib/format";
import styles from "./ArcGauge.module.css";

interface Props {
  value: number;
  max: number;
  /** Coloured bands: [upTo, colour] */
  bands: [number, string][];
  label: string;
  children?: React.ReactNode;
}

const R = 44;
const CX = 56;
const CY = 54;

const point = (k: number, r = R) => {
  const a = Math.PI * (1 - k);
  return [CX + Math.cos(a) * r, CY - Math.sin(a) * r];
};

function arc(k0: number, k1: number) {
  const [x0, y0] = point(k0);
  const [x1, y1] = point(k1);
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
}

/** Half-circle gauge with coloured bands and a glowing marker. */
export function ArcGauge({ value, max, bands, label, children }: Props) {
  const k = clamp(value / max, 0, 1);
  const [mx, my] = point(k);
  let prev = 0;
  const gap = 0.012;

  return (
    <div className={styles.wrap}>
      <svg viewBox="0 0 112 64" className={styles.svg} role="img" aria-label={label}>
        {bands.map(([upTo, color], i) => {
          const k0 = prev / max + (i ? gap : 0);
          const k1 = Math.min(upTo, max) / max - gap;
          prev = upTo;
          return <path key={i} d={arc(k0, Math.max(k0, k1))} stroke={color} className={styles.band} />;
        })}
        <circle cx={mx} cy={my} r="6.5" className={styles.marker} style={{ ["--x" as string]: `${mx}px`, ["--y" as string]: `${my}px` }} />
      </svg>
      <div className={styles.center}>{children}</div>
    </div>
  );
}
