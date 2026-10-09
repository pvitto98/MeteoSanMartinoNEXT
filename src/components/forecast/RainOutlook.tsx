import { fmt, stationIsoNow } from "@/lib/format";
import type { ForecastHour } from "@/lib/types";
import styles from "./RainOutlook.module.css";

/** Next 48 hours of rain: bar height = mm, opacity = probability. */
export function RainOutlook({ hours }: { hours: ForecastHour[] }) {
  const nowHour = stationIsoNow().slice(0, 13);
  const items = hours.filter((h) => h.time.slice(0, 13) >= nowHour).slice(0, 48);
  const total = items.reduce((s, h) => s + h.precipitation, 0);
  const peak = Math.max(1, ...items.map((h) => h.precipitation));
  const firstWet = items.find((h) => h.precipitationProbability >= 40 && h.precipitation >= 0.1);

  return (
    <div>
      <p className={styles.summary}>
        {firstWet
          ? `Prima pioggia probabile ${firstWet.time.slice(0, 10) === items[0]?.time.slice(0, 10) ? "oggi" : "domani"} alle ${firstWet.time.slice(11, 13)}, circa ${fmt(total)} mm in 48 ore.`
          : "Nessuna pioggia significativa nelle prossime 48 ore."}
      </p>
      <div className={styles.chart} role="img" aria-label="Pioggia prevista ora per ora">
        {items.map((h) => (
          <span
            key={h.time}
            className={`${styles.bar} ${h.time.slice(11, 13) === "00" ? styles.midnight : ""}`}
            style={{
              height: `${Math.max(3, (h.precipitation / peak) * 100)}%`,
              opacity: 0.25 + (h.precipitationProbability / 100) * 0.75,
            }}
            title={`${h.time.slice(11, 16)} · ${fmt(h.precipitation)} mm · ${h.precipitationProbability}%`}
          />
        ))}
      </div>
      <div className={styles.axis}>
        <span>Ora</span>
        <span>+12h</span>
        <span>+24h</span>
        <span>+36h</span>
        <span>+48h</span>
      </div>
    </div>
  );
}
