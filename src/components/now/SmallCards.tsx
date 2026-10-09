import { Card, Metric } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ArcGauge } from "@/components/charts/ArcGauge";
import { Sparkline } from "@/components/charts/Sparkline";
import { aqiLevel, dewComfort, fmt, relativeTime, uvLevel } from "@/lib/format";
import type { StationNow, StationToday } from "@/lib/types";
import styles from "./SmallCards.module.css";

const UV_BANDS: [number, string][] = [
  [3, "#4ade80"],
  [6, "#facc15"],
  [8, "#fb923c"],
  [11, "#ef4444"],
  [13, "#a855f7"],
];

export function UvCard({ now, today, index }: { now: StationNow; today?: StationToday; index?: number }) {
  const level = uvLevel(now.solar.uvi);
  const peak = Math.max(now.solar.uvi, ...(today?.uvi.map((p) => p.v) ?? []));
  return (
    <Card title="Indice UV" icon="sun" index={index}>
      <ArcGauge value={now.solar.uvi} max={13} bands={UV_BANDS} label={`Indice UV ${now.solar.uvi}, ${level.label}`}>
        <Metric value={fmt(now.solar.uvi, 0)} size="md" />
      </ArcGauge>
      <p className={styles.level} style={{ color: level.color }}>
        {level.label}
      </p>
      <p className={styles.hint}>{now.solar.uvi > 0 ? level.advice : `Picco di oggi: ${fmt(peak, 0)}`}</p>
    </Card>
  );
}

const AQI_BANDS: [number, string][] = [
  [50, "#4ade80"],
  [100, "#facc15"],
  [150, "#fb923c"],
  [200, "#ef4444"],
  [300, "#a855f7"],
];

export function AirCard({ now, index }: { now: StationNow; index?: number }) {
  if (now.air.aqi === null) return null;
  const level = aqiLevel(now.air.aqi);
  return (
    <Card title="Aria" icon="leaf" index={index}>
      <ArcGauge value={now.air.aqi} max={300} bands={AQI_BANDS} label={`Qualità dell'aria ${level.label}`}>
        <Metric value={fmt(now.air.aqi, 0)} unit="AQI" size="md" />
      </ArcGauge>
      <p className={styles.level} style={{ color: level.color }}>
        {level.label}
      </p>
      <p className={styles.hint}>PM2.5 {fmt(now.air.pm25, 0)} µg/m³</p>
    </Card>
  );
}

/** Pressure tendency over three hours, the barometer's forecast. */
function tendency(today?: StationToday, current?: number) {
  const series = today?.pressure ?? [];
  if (series.length < 2 || current === undefined) return null;
  const target = series.at(-1)!.t - 3 * 3600_000;
  const past = series.reduce((best, p) => (Math.abs(p.t - target) < Math.abs(best.t - target) ? p : best), series[0]);
  const delta = current - past.v;
  if (delta <= -3) return { delta, label: "In forte calo", note: "Peggioramento in arrivo", icon: "arrowDown" as const };
  if (delta <= -1) return { delta, label: "In calo", note: "Possibile peggioramento", icon: "arrowDown" as const };
  if (delta >= 3) return { delta, label: "In forte aumento", note: "Miglioramento deciso", icon: "arrowUp" as const };
  if (delta >= 1) return { delta, label: "In aumento", note: "Tempo in miglioramento", icon: "arrowUp" as const };
  return { delta, label: "Stabile", note: "Nessun cambiamento in vista", icon: "arrowRight" as const };
}

export function PressureCard({ now, today, index }: { now: StationNow; today?: StationToday; index?: number }) {
  const trend = tendency(today, now.pressure.relative);
  return (
    <Card title="Pressione" icon="gauge" index={index}>
      <Metric value={fmt(now.pressure.relative, 0)} unit="hPa" size="md" />
      {trend && (
        <p className={styles.trend}>
          <Icon name={trend.icon} size={15} strokeWidth={2.4} />
          {trend.label} <span className="tabular">({trend.delta > 0 ? "+" : ""}{fmt(trend.delta)} in 3h)</span>
        </p>
      )}
      {today && today.pressure.length > 2 && <Sparkline points={today.pressure} color="#c4d6ff" height={34} />}
      <p className={styles.hint}>{trend?.note ?? "Pressione al livello del mare"}</p>
    </Card>
  );
}

export function HumidityCard({ now, today, index }: { now: StationNow; today?: StationToday; index?: number }) {
  const h = now.outdoor.humidity;
  const circumference = 2 * Math.PI * 22;
  return (
    <Card title="Umidità" icon="humidity" index={index}>
      <div className={styles.humidity}>
        <svg viewBox="0 0 56 56" width="56" height="56" aria-hidden="true">
          <circle cx="28" cy="28" r="22" className={styles.ringBg} />
          <circle
            cx="28"
            cy="28"
            r="22"
            className={styles.ring}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - h / 100)}
            transform="rotate(-90 28 28)"
          />
        </svg>
        <Metric value={fmt(h, 0)} unit="%" size="md" />
      </div>
      {today && today.humidity.length > 2 && <Sparkline points={today.humidity} color="#8fd3ff" height={26} />}
      <p className={styles.trend}>Rugiada {fmt(now.outdoor.dewPoint)}°</p>
      <p className={styles.hint}>{dewComfort(now.outdoor.dewPoint)}</p>
    </Card>
  );
}

const RECENT_STRIKE_MS = 3 * 3600_000;

/** The lightning card only appears on days with strikes. */
export function showsLightning(now: StationNow, clock: Date) {
  const { countToday, lastTime } = now.lightning;
  return countToday > 0 || (lastTime !== null && clock.getTime() - lastTime < RECENT_STRIKE_MS);
}

export function LightningCard({ now, clock, index }: { now: StationNow; clock: Date; index?: number }) {
  const { countToday, lastDistanceKm, lastTime } = now.lightning;
  if (!showsLightning(now, clock)) return null;
  const recent = lastTime !== null && clock.getTime() - lastTime < RECENT_STRIKE_MS;
  return (
    <Card title="Fulmini" icon="bolt" wide="mobile" index={index} className={recent ? styles.stormy : ""}>
      <div className={styles.lightning}>
        <div className={styles.radar} aria-hidden="true">
          <span />
          <span />
          <span />
          {recent && lastDistanceKm !== null && <i style={{ ["--d" as string]: Math.min(1, lastDistanceKm / 40) }} />}
        </div>
        <div>
          <Metric value={fmt(countToday, 0)} unit="oggi" size="lg" />
          {lastTime && (
            <p className={styles.trend}>
              Ultimo {relativeTime(lastTime, clock.getTime())}
              {lastDistanceKm !== null && ` a ${fmt(lastDistanceKm, 0)} km`}
            </p>
          )}
          <p className={styles.hint}>Il sensore rileva le scariche fino a 40 km di distanza.</p>
        </div>
      </div>
    </Card>
  );
}
