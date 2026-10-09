import { fmt, MONTHS_SHORT, tempColor, WEEKDAYS_SHORT } from "@/lib/format";
import type { DailyRecord } from "@/lib/types";
import styles from "./Calendar.module.css";

/** Month grid: each day tinted by its mean temperature, with a drop when it rained. */
export function MonthCalendar({ year, month, days, onSelect }: { year: number; month: number; days: DailyRecord[]; onSelect: (d: DailyRecord) => void }) {
  const byDay = new Map(days.map((d) => [d.day, d]));
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = (first + 6) % 7; // Monday first
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return (
    <div className={styles.calendar}>
      {WEEKDAYS_SHORT.map((w) => (
        <span key={w} className={styles.weekday}>
          {w.charAt(0)}
        </span>
      ))}
      {Array.from({ length: offset }, (_, i) => (
        <span key={`pad${i}`} />
      ))}
      {Array.from({ length: count }, (_, i) => {
        const d = byDay.get(i + 1);
        if (!d) {
          return (
            <span key={i} className={`${styles.cell} ${styles.empty}`}>
              {i + 1}
            </span>
          );
        }
        return (
          <button
            key={i}
            className={styles.cell}
            style={{ background: `color-mix(in srgb, ${tempColor(d.tempAvg)} 70%, transparent)`, animationDelay: `${i * 15}ms` }}
            onClick={() => onSelect(d)}
            aria-label={`${d.day}: media ${fmt(d.tempAvg)}°, pioggia ${fmt(d.precipTotal)} mm`}
          >
            <span className={styles.num}>{d.day}</span>
            <span className={`${styles.t} tabular`}>{fmt(d.tempAvg, 0)}°</span>
            {d.precipTotal >= 1 && <span className={styles.drop}>{fmt(d.precipTotal, 0)}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Whole-year heatmap, one square per day (GitHub style), weeks as columns. */
export function YearHeatmap({ year, days, onSelect }: { year: number; days: DailyRecord[]; onSelect: (d: DailyRecord) => void }) {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const jan1 = Date.UTC(year, 0, 1);
  const offset = (new Date(jan1).getUTCDay() + 6) % 7;
  const total = (Date.UTC(year + 1, 0, 1) - jan1) / 86_400_000;
  const weeks = Math.ceil((total + offset) / 7);
  // Column where each month starts, for the labels row.
  const monthCols = MONTHS_SHORT.map((label, m) => ({
    label,
    col: Math.floor(((Date.UTC(year, m, 1) - jan1) / 86_400_000 + offset) / 7) + 1,
  }));

  return (
    <div className={`${styles.heatScroll} h-scroll`}>
      <div className={styles.heatmap} style={{ gridTemplateColumns: `repeat(${weeks}, 14px)` }}>
        {monthCols.map((m) => (
          <span key={m.label} className={styles.monthLabel} style={{ gridColumn: `${m.col} / span 4`, gridRow: 1 }}>
            {m.label}
          </span>
        ))}
        {Array.from({ length: weeks * 7 }, (_, i) => {
          const col = Math.floor(i / 7);
          const row = (i % 7) + 1; // row 1 holds the month labels
          const dayIndex = col * 7 + (row - 1) - offset;
          if (dayIndex < 0 || dayIndex >= total) return <span key={i} style={{ gridColumn: col + 1, gridRow: row + 1 }} />;

          const date = new Date(jan1 + dayIndex * 86_400_000);
          const key = `${year}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
          const d = byDate.get(key);
          return (
            <button
              key={i}
              className={styles.sq}
              style={{
                gridColumn: col + 1,
                gridRow: row + 1,
                background: d ? tempColor(d.tempAvg) : "rgba(255,255,255,0.06)",
                outline: d && d.precipTotal >= 5 ? "1.5px solid #9bd8ff" : undefined,
              }}
              disabled={!d}
              onClick={() => d && onSelect(d)}
              aria-label={d ? `${date.getUTCDate()}/${date.getUTCMonth() + 1}: ${fmt(d.tempAvg)}°` : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
