import { useState } from "react";
import { WeatherIcon } from "@/components/sky/WeatherIcon";
import { Icon } from "@/components/ui/Icon";
import { dayMonthOf, fmt, stationIsoNow, tempColor, uvLevel, weekdayOf } from "@/lib/format";
import { wmo } from "@/lib/sky";
import type { ForecastDay } from "@/lib/types";
import styles from "./DailyList.module.css";

/** Apple-style week view: every day's range drawn on one shared temperature scale. */
export function DailyList({ days, current }: { days: ForecastDay[]; current?: number }) {
  const [open, setOpen] = useState<string | null>(null);
  const todayIso = stationIsoNow().slice(0, 10);
  const list = days.filter((d) => d.date >= todayIso);
  const lo = Math.min(...list.map((d) => d.tempMin));
  const hi = Math.max(...list.map((d) => d.tempMax));
  const pos = (t: number) => ((t - lo) / (hi - lo || 1)) * 100;

  return (
    <ul className={styles.list}>
      {list.map((d, i) => {
        const { kind, label } = wmo(d.weatherCode);
        const expanded = open === d.date;
        const name = i === 0 ? "Oggi" : i === 1 ? "Domani" : weekdayOf(d.date, "short");
        return (
          <li key={d.date} className={`${styles.item} ${expanded ? styles.expanded : ""}`}>
            <button className={styles.row} onClick={() => setOpen(expanded ? null : d.date)} aria-expanded={expanded}>
              <span className={styles.day}>
                {name}
                <small>{dayMonthOf(d.date)}</small>
              </span>
              <span className={styles.icon}>
                <WeatherIcon kind={kind} size={40} still title={label} />
                {d.precipitationProbability >= 20 && <small className="tabular">{d.precipitationProbability}%</small>}
              </span>
              <span className={`${styles.min} tabular`}>{fmt(d.tempMin, 0)}°</span>
              <span className={styles.track}>
                <span
                  className={styles.range}
                  style={{
                    left: `${pos(d.tempMin)}%`,
                    right: `${100 - pos(d.tempMax)}%`,
                    background: `linear-gradient(90deg, ${tempColor(d.tempMin)}, ${tempColor(d.tempMax)})`,
                  }}
                />
                {i === 0 && current !== undefined && current >= lo && current <= hi && (
                  <span className={styles.now} style={{ left: `${pos(current)}%` }} />
                )}
              </span>
              <span className={`${styles.max} tabular`}>{fmt(d.tempMax, 0)}°</span>
            </button>
            {expanded && (
              <dl className={styles.details}>
                <div>
                  <dt>Cielo</dt>
                  <dd>{label}</dd>
                </div>
                <div>
                  <dt>Pioggia</dt>
                  <dd>
                    {fmt(d.precipitationSum)} mm · {d.precipitationProbability}%
                  </dd>
                </div>
                <div>
                  <dt>Vento max</dt>
                  <dd>
                    {fmt(d.windSpeedMax, 0)} km/h · raffiche {fmt(d.windGustMax, 0)}
                  </dd>
                </div>
                <div>
                  <dt>UV max</dt>
                  <dd style={{ color: uvLevel(d.uvIndexMax).color }}>
                    {fmt(d.uvIndexMax, 0)} · {uvLevel(d.uvIndexMax).label}
                  </dd>
                </div>
                <div>
                  <dt>
                    <Icon name="sunrise" size={13} /> Alba
                  </dt>
                  <dd>{d.sunrise.slice(11, 16)}</dd>
                </div>
                <div>
                  <dt>
                    <Icon name="sunset" size={13} /> Tramonto
                  </dt>
                  <dd>{d.sunset.slice(11, 16)}</dd>
                </div>
              </dl>
            )}
          </li>
        );
      })}
    </ul>
  );
}
