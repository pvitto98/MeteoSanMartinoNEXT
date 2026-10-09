import { Card, Metric } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { beaufort, cardinal, circularMean, fmt, windName } from "@/lib/format";
import type { StationNow, StationToday } from "@/lib/types";
import styles from "./WindCard.module.css";

const R = 70;
const C = 80;

export function WindCard({ now, today, index }: { now: StationNow; today?: StationToday; index?: number }) {
  const dir = now.wind.direction10m ?? now.wind.direction;
  const bf = beaufort(now.wind.speed);
  const lastHour = today?.windDirection.filter((p) => p.t >= now.updatedAt - 3600_000).map((p) => p.v) ?? [];
  const trail = lastHour.length ? lastHour : [dir];
  const prevailing = circularMean(trail);
  const maxGustToday = Math.max(now.wind.gust, ...(today?.windGust.map((p) => p.v) ?? []));
  // Gusty wind makes the needle fidget.
  const wobble = Math.min(14, Math.max(2, now.wind.gust - now.wind.speed));

  return (
    <Card title="Vento" icon="wind" wide="mobile" index={index} aside={bf.label}>
      <div className={styles.layout}>
        <svg viewBox="0 0 160 160" className={styles.rose} role="img" aria-label={`Vento da ${cardinal(dir)} a ${fmt(now.wind.speed)} km/h`}>
          <circle cx={C} cy={C} r={R} className={styles.ring} />
          {Array.from({ length: 72 }, (_, i) => {
            const major = i % 9 === 0;
            return (
              <line
                key={i}
                x1={C}
                y1={C - R + 2}
                x2={C}
                y2={C - R + (major ? 10 : 6)}
                className={major ? styles.tickMajor : styles.tick}
                transform={`rotate(${i * 5} ${C} ${C})`}
              />
            );
          })}
          {(["N", "E", "S", "O"] as const).map((l, i) => (
            <text key={l} x={C + Math.sin((i * Math.PI) / 2) * (R - 20)} y={C - Math.cos((i * Math.PI) / 2) * (R - 20) + 4} className={styles.letter}>
              {l}
            </text>
          ))}
          {/* Where the wind came from during the last hour */}
          {trail.map((d, i) => (
            <circle
              key={i}
              cx={C + Math.sin((d * Math.PI) / 180) * (R + 1)}
              cy={C - Math.cos((d * Math.PI) / 180) * (R + 1)}
              r="2.5"
              className={styles.trail}
              style={{ opacity: 0.15 + (i / trail.length) * 0.5 }}
            />
          ))}
          <g className={styles.needle} style={{ transform: `rotate(${dir}deg)`, ["--wobble" as string]: `${wobble}deg` }}>
            <path d={`M${C} ${C - R + 4} l7 16 h-14 z`} className={styles.head} />
            <line x1={C} y1={C - R + 18} x2={C} y2={C + R - 10} className={styles.shaft} />
            <circle cx={C} cy={C + R - 10} r="3" className={styles.tail} />
          </g>
          <circle cx={C} cy={C} r="30" className={styles.hub} />
          <text x={C} y={C + 2} className={`${styles.speed} tabular`}>
            {fmt(now.wind.speed, 0)}
          </text>
          <text x={C} y={C + 16} className={styles.unit}>
            km/h
          </text>
        </svg>

        <dl className={styles.stats}>
          <div className={styles.name}>
            <dt>Da {cardinal(dir)}</dt>
            <dd>{windName(dir)}</dd>
          </div>
          <div>
            <dt>Raffica</dt>
            <dd>
              <Metric value={<AnimatedNumber value={now.wind.gust} />} unit="km/h" size="sm" />
            </dd>
          </div>
          <div>
            <dt>Raffica max oggi</dt>
            <dd>
              <Metric value={fmt(maxGustToday)} unit="km/h" size="sm" />
            </dd>
          </div>
          <div>
            <dt>Prevalente ultima ora</dt>
            <dd className={styles.small}>
              {cardinal(prevailing)} · {fmt(prevailing, 0)}°
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
