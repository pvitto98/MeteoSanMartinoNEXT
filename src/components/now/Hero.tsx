import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Icon } from "@/components/ui/Icon";
import { WeatherIcon } from "@/components/sky/WeatherIcon";
import { cardinal, fmt, formatLongDate, relativeTime, stationMidnight, uvLevel } from "@/lib/format";
import { moon, type Condition } from "@/lib/sky";
import type { Forecast, StationNow, StationToday } from "@/lib/types";
import { insight } from "./insight";
import styles from "./Hero.module.css";

const STALE_AFTER_MS = 15 * 60_000;

interface Props {
  now: StationNow;
  today?: StationToday;
  forecast?: Forecast;
  condition: Condition;
  clock: Date;
}

export function Hero({ now, today, forecast, condition, clock }: Props) {
  const temps = today?.temperature.filter((p) => p.t >= stationMidnight(clock)).map((p) => p.v) ?? [];
  const hi = temps.length ? Math.max(...temps, now.outdoor.temperature) : null;
  const lo = temps.length ? Math.min(...temps, now.outdoor.temperature) : null;
  const stale = clock.getTime() - now.updatedAt > STALE_AFTER_MS;

  return (
    <section className={`${styles.hero} reveal`} aria-label="Condizioni attuali">
      <div className={styles.meta}>
        <span>{formatLongDate(clock)}</span>
        <span className={`${styles.live} ${stale ? styles.stale : ""}`}>
          <i />
          {stale ? `Ultimo dato ${relativeTime(now.updatedAt, clock.getTime())}` : `Live · ${relativeTime(now.updatedAt, clock.getTime())}`}
        </span>
      </div>

      <div className={styles.main}>
        <div className={styles.readout}>
          <p className={styles.condition}>{condition.label}</p>
          <p className={`${styles.temp} tabular`}>
            <AnimatedNumber value={now.outdoor.temperature} />
            <span className={styles.deg}>°</span>
          </p>
          <p className={styles.sub}>
            Percepita {fmt(now.outdoor.feelsLike)}°
            {hi !== null && lo !== null && (
              <>
                <span className={styles.dot}>·</span>
                <Icon name="arrowUp" size={13} strokeWidth={2.4} />
                {fmt(hi)}°
                <Icon name="arrowDown" size={13} strokeWidth={2.4} />
                {fmt(lo)}°
              </>
            )}
          </p>
        </div>
        <div className={styles.icon}>
          <WeatherIcon kind={condition.kind} size={150} moonPhase={moon(clock).phase} title={condition.label} />
        </div>
      </div>

      <p className={styles.insight}>{insight(now, today, forecast, clock)}</p>

      <dl className={styles.pills}>
        <div>
          <dt>Umidità</dt>
          <dd className="tabular">{fmt(now.outdoor.humidity, 0)}%</dd>
        </div>
        <div>
          <dt>Vento</dt>
          <dd className="tabular">
            {fmt(now.wind.speed, 0)} <small>km/h {cardinal(now.wind.direction)}</small>
          </dd>
        </div>
        <div>
          <dt>Pioggia</dt>
          <dd className="tabular">
            {fmt(now.rain.daily)} <small>mm</small>
          </dd>
        </div>
        <div>
          <dt>UV</dt>
          <dd className="tabular" style={{ color: now.solar.uvi >= 3 ? uvLevel(now.solar.uvi).color : undefined }}>
            {fmt(now.solar.uvi, 0)}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className={styles.hero} aria-busy="true">
      <div className="skeleton" style={{ width: 180, height: 14 }} />
      <div className={styles.main}>
        <div className={styles.readout}>
          <div className="skeleton" style={{ width: 110, height: 22, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: 190, height: 96 }} />
        </div>
        <div className="skeleton" style={{ width: 120, height: 120, borderRadius: "50%" }} />
      </div>
      <div className="skeleton" style={{ height: 64, borderRadius: 20 }} />
    </section>
  );
}
