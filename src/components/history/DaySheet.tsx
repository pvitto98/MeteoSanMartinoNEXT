import { Sheet } from "@/components/ui/Sheet";
import { Icon, type IconName } from "@/components/ui/Icon";
import { isValid } from "@/lib/archive";
import { cardinal, fmt, formatArchiveDate, tempColor, uvLevel, windName, weekdayOf } from "@/lib/format";
import type { DailyRecord } from "@/lib/types";
import styles from "./DaySheet.module.css";

/** Everything the station recorded on one day. */
export function DaySheet({ day, onClose }: { day: DailyRecord | null; onClose: () => void }) {
  if (!day) return null;
  const iso = `${day.date.slice(0, 4)}-${day.date.slice(4, 6)}-${day.date.slice(6, 8)}`;
  const rows: { icon: IconName; label: string; value: string; sub?: string }[] = [
    { icon: "humidity", label: "Umidità", value: `${fmt(day.humidityAvg, 0)}%`, sub: `${fmt(day.humidityLow, 0)}–${fmt(day.humidityHigh, 0)}%` },
    { icon: "drop", label: "Pioggia", value: `${fmt(day.precipTotal)} mm`, sub: day.precipRate > 0 ? `max ${fmt(day.precipRate)} mm/h` : undefined },
    {
      icon: "wind",
      label: "Vento",
      value: `${fmt(day.windspeedAvg)} km/h`,
      sub: `${windName(day.winddirAvg)} (${cardinal(day.winddirAvg)}) · raffica ${fmt(day.windgustHigh, 0)}`,
    },
    { icon: "gauge", label: "Pressione", value: `${fmt(day.pressureMin, 0)}–${fmt(day.pressureMax, 0)} hPa` },
    { icon: "thermometer", label: "Punto di rugiada", value: `${fmt(day.dewptAvg)}°`, sub: `${fmt(day.dewptLow)}–${fmt(day.dewptHigh)}°` },
  ];
  if (isValid(day.uvHigh)) rows.push({ icon: "sun", label: "UV massimo", value: fmt(day.uvHigh, 0), sub: `${uvLevel(day.uvHigh).label} · ${fmt(day.solarRadiationHigh, 0)} W/m²` });
  if (isValid(day.pm25Avg)) rows.push({ icon: "leaf", label: "PM2.5 medio", value: `${fmt(day.pm25Avg, 0)} µg/m³`, sub: `max ${fmt(day.pm25Max, 0)}` });
  if (day.lightningCount > 0) rows.push({ icon: "bolt", label: "Fulmini", value: fmt(day.lightningCount, 0) });

  return (
    <Sheet open onClose={onClose} label={`Dettagli del ${formatArchiveDate(day.date)}`}>
      <p className={styles.kicker}>{weekdayOf(iso)}</p>
      <h2 className={styles.title}>{formatArchiveDate(day.date)}</h2>

      <div className={styles.temps}>
        {[
          ["Min", day.tempLow],
          ["Media", day.tempAvg],
          ["Max", day.tempHigh],
        ].map(([label, v]) => (
          <div key={label as string}>
            <span>{label}</span>
            <strong className="tabular" style={{ color: tempColor(v as number) }}>
              {fmt(v as number)}°
            </strong>
          </div>
        ))}
      </div>

      <ul className={styles.rows}>
        {rows.map((r) => (
          <li key={r.label}>
            <span className={styles.icon}>
              <Icon name={r.icon} size={17} />
            </span>
            <span className={styles.label}>{r.label}</span>
            <span className={styles.value}>
              <strong className="tabular">{r.value}</strong>
              {r.sub && <small>{r.sub}</small>}
            </span>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
