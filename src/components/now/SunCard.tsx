import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { clamp, fmt, formatTime } from "@/lib/format";
import { moon, sunTimes, type Condition } from "@/lib/sky";
import type { StationNow } from "@/lib/types";
import styles from "./SunCard.module.css";

const W = 300;
const H = 120;

/** The sun's path today, where it is now, and how much of its light actually reaches the station. */
export function SunCard({ now, condition, clock, index }: { now: StationNow; condition: Condition; clock: Date; index?: number }) {
  const { sunrise, sunset } = sunTimes(clock);
  const dayLength = sunset.getTime() - sunrise.getTime();
  const progress = clamp((clock.getTime() - sunrise.getTime()) / dayLength, 0, 1);
  const isDay = clock > sunrise && clock < sunset;
  const m = moon(clock);

  // Parabolic arc from sunrise (left) to sunset (right)
  const x = (p: number) => 20 + p * (W - 40);
  const y = (p: number) => H - 22 - Math.sin(p * Math.PI) * (H - 40);
  const arc = Array.from({ length: 41 }, (_, i) => `${i ? "L" : "M"}${x(i / 40).toFixed(1)},${y(i / 40).toFixed(1)}`).join("");
  const done = Array.from({ length: Math.round(progress * 40) + 1 }, (_, i) => {
    const p = Math.min(progress, i / 40);
    return `${i ? "L" : "M"}${x(p).toFixed(1)},${y(p).toFixed(1)}`;
  }).join("");

  const hours = Math.floor(dayLength / 3600_000);
  const minutes = Math.round((dayLength % 3600_000) / 60_000);
  const csi = condition.clearSkyIndex;

  return (
    <Card title="Sole" icon="sun" wide="mobile" index={index} aside={`${hours} h ${minutes} min di luce`}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label={`Alba ${formatTime(sunrise)}, tramonto ${formatTime(sunset)}`}>
        <defs>
          <linearGradient id="sunpath" x1="0" x2="1">
            <stop offset="0" stopColor="#ff9f6b" />
            <stop offset="0.5" stopColor="#ffe28a" />
            <stop offset="1" stopColor="#ff8a6b" />
          </linearGradient>
          <radialGradient id="sunball">
            <stop offset="0" stopColor="#fff7d1" />
            <stop offset="0.6" stopColor="#ffd34d" />
            <stop offset="1" stopColor="#ffb020" stopOpacity="0" />
          </radialGradient>
        </defs>
        <line x1="8" x2={W - 8} y1={H - 22} y2={H - 22} className={styles.horizon} />
        <path d={arc} className={styles.path} />
        <path d={done} className={styles.done} />
        {isDay ? (
          <circle cx={x(progress)} cy={y(progress)} r="13" fill="url(#sunball)" className={styles.sun} />
        ) : (
          <text x={W / 2} y={H - 40} className={styles.night}>
            {m.name} · {Math.round(m.fraction * 100)}% illuminata
          </text>
        )}
      </svg>
      <div className={styles.times}>
        <span>
          <Icon name="sunrise" size={16} /> {formatTime(sunrise)}
        </span>
        <span>
          {formatTime(sunset)} <Icon name="sunset" size={16} />
        </span>
      </div>

      {csi !== null && (
        <div className={styles.light}>
          <div className={styles.lightHead}>
            <span>Luce che arriva al suolo</span>
            <strong className="tabular">{fmt(clamp(csi, 0, 1.2) * 100, 0)}%</strong>
          </div>
          <div className={styles.bar}>
            <span style={{ width: `${clamp(csi, 0, 1) * 100}%` }} />
          </div>
          <p className={styles.caption}>
            {fmt(now.solar.radiation, 0)} W/m² misurati rispetto al cielo sereno: è così che la stazione capisce se è nuvoloso.
          </p>
        </div>
      )}
    </Card>
  );
}
