import { WeatherIcon } from "@/components/sky/WeatherIcon";
import { scale, smoothPath, type Pt } from "@/components/charts/path";
import { fmt, stationIsoNow, tempColor, weekdayOf } from "@/lib/format";
import { wmo } from "@/lib/sky";
import type { ForecastHour } from "@/lib/types";
import styles from "./HourlyStrip.module.css";

const COL = 58;
const CURVE_H = 62;

/** Swipeable hour-by-hour forecast with a temperature curve running through it. */
export function HourlyStrip({ hours, from = new Date(), count = 25 }: { hours: ForecastHour[]; from?: Date; count?: number }) {
  const currentHour = stationIsoNow(from).slice(0, 13);
  const items = hours.filter((h) => h.time.slice(0, 13) >= currentHour).slice(0, count);
  if (!items.length) return null;

  const temps = items.map((h) => h.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const y = scale(min, max === min ? min + 1 : max, CURVE_H - 10, 24);
  const pts: Pt[] = items.map((h, i) => [i * COL + COL / 2, y(h.temperature)]);
  const width = items.length * COL;

  return (
    <div className={`${styles.scroller} h-scroll`}>
      <div className={styles.track} style={{ width }}>
        <svg width={width} height={CURVE_H} className={styles.curve} aria-hidden="true">
          <defs>
            <linearGradient id="hourly-curve" gradientUnits="userSpaceOnUse" x1="0" x2={width} y1="0" y2="0">
              {items.map((h, i) => (
                <stop key={h.time} offset={i / Math.max(1, items.length - 1)} stopColor={tempColor(h.temperature)} />
              ))}
            </linearGradient>
          </defs>
          <path d={smoothPath(pts)} fill="none" stroke="url(#hourly-curve)" strokeWidth="2.5" strokeLinecap="round" />
          {pts.map(([px, py], i) => (
            <g key={items[i].time}>
              <circle cx={px} cy={py} r="3" fill="#fff" />
              <text x={px} y={py - 8} className={styles.temp}>
                {fmt(items[i].temperature, 0)}°
              </text>
            </g>
          ))}
        </svg>
        <ol className={styles.cols}>
          {items.map((h, i) => {
            const hour = h.time.slice(11, 13);
            const midnight = hour === "00";
            const { kind, label } = wmo(h.weatherCode, h.isDay);
            return (
              <li key={h.time} className={`${styles.col} ${midnight ? styles.midnight : ""}`} style={{ width: COL }}>
                <WeatherIcon kind={kind} size={40} still title={label} />
                <span className={`${styles.pop} tabular`} style={{ opacity: h.precipitationProbability >= 20 ? 1 : 0 }}>
                  {h.precipitationProbability}%
                </span>
                <span className={styles.hour}>{i === 0 ? "Ora" : midnight ? weekdayOf(h.time, "short") : hour}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
