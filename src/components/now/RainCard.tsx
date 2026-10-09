import { Card, Metric } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { fmt, rainIntensity } from "@/lib/format";
import type { StationNow } from "@/lib/types";
import styles from "./RainCard.module.css";

/** A rain gauge that really fills up with today's rain. */
export function RainCard({ now, index }: { now: StationNow; index?: number }) {
  const raining = now.rain.rate > 0;
  const capacity = Math.max(10, Math.ceil(now.rain.daily / 10) * 10);
  const level = Math.min(1, now.rain.daily / capacity);

  return (
    <Card title="Pioggia" icon="drop" wide="mobile" index={index} className={raining ? styles.raining : ""} aside={raining ? rainIntensity(now.rain.rate) : undefined}>
      <div className={styles.layout}>
        <div className={styles.gauge} aria-hidden="true">
          <div className={styles.tube}>
            <div className={styles.water} style={{ height: `${Math.max(level * 100, now.rain.daily > 0 ? 4 : 0)}%` }}>
              <svg viewBox="0 0 120 12" preserveAspectRatio="none" className={styles.wave}>
                <path d="M0 6 Q15 0 30 6 T60 6 T90 6 T120 6 V12 H0Z" />
              </svg>
            </div>
            {[0.25, 0.5, 0.75].map((m) => (
              <span key={m} className={styles.mark} style={{ bottom: `${m * 100}%` }}>
                {fmt(capacity * m, 1)}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.stats}>
          <div>
            <span className={styles.label}>Oggi</span>
            <Metric value={<AnimatedNumber value={now.rain.daily} />} unit="mm" size="lg" />
          </div>
          <dl className={styles.grid}>
            <div>
              <dt>Intensità</dt>
              <dd className="tabular">
                {fmt(now.rain.rate)} <small>mm/h</small>
              </dd>
            </div>
            <div>
              <dt>Settimana</dt>
              <dd className="tabular">
                {fmt(now.rain.weekly)} <small>mm</small>
              </dd>
            </div>
            <div>
              <dt>Mese</dt>
              <dd className="tabular">
                {fmt(now.rain.monthly)} <small>mm</small>
              </dd>
            </div>
            <div>
              <dt>Anno</dt>
              <dd className="tabular">
                {fmt(now.rain.yearly, 0)} <small>mm</small>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Card>
  );
}
