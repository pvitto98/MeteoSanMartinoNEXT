import Head from "next/head";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmt, formatArchiveDate, parseArchiveDate, tempColor } from "@/lib/format";
import { useRecords } from "@/lib/hooks";
import type { RecordEntry } from "@/lib/types";
import styles from "./record.module.css";

interface Medal {
  title: string;
  icon: IconName;
  entry: RecordEntry;
  unit: string;
  digits?: number;
  color: string;
}

export default function RecordsPage() {
  const { data: r, error } = useRecords();

  if (error && !r) {
    return (
      <>
        <PageHeader title="Record" />
        <Card title="Archivio non disponibile" icon="offline">
          <p>Non riusciamo a leggere l&apos;archivio in questo momento.</p>
        </Card>
      </>
    );
  }

  if (!r) {
    return (
      <>
        <PageHeader title="Record" subtitle="Gli estremi misurati a San Martino" />
        <div className={styles.grid}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton" style={{ height: 130, borderRadius: 26 }} />
          ))}
        </div>
      </>
    );
  }

  const medals: Medal[] = (
    [
      { title: "Giorno più caldo", icon: "sun", entry: r.hottest, unit: "°", color: tempColor(r.hottest.value) },
      { title: "Notte più fredda", icon: "thermometer", entry: r.coldest, unit: "°", color: tempColor(r.coldest.value) },
      { title: "Notte più calda", icon: "thermometer", entry: r.warmestNight, unit: "°", color: tempColor(r.warmestNight.value) },
      { title: "Giorno più freddo", icon: "thermometer", entry: r.coolestDay, unit: "°", color: tempColor(r.coolestDay.value) },
      { title: "Giorno più piovoso", icon: "drop", entry: r.wettest, unit: " mm", digits: 0, color: "#6cc4ff" },
      { title: "Raffica più forte", icon: "wind", entry: r.strongestGust, unit: " km/h", digits: 0, color: "#c4d6ff" },
      { title: "Più fulmini", icon: "bolt", entry: r.mostLightning, unit: "", digits: 0, color: "#ffd36b" },
      { title: "UV più alto", icon: "sun", entry: r.highestUv, unit: "", digits: 0, color: "#c084fc" },
      { title: "Pressione più alta", icon: "gauge", entry: r.highestPressure, unit: " hPa", digits: 0, color: "#e2e8f0" },
      { title: "Pressione più bassa", icon: "gauge", entry: r.lowestPressure, unit: " hPa", digits: 0, color: "#e2e8f0" },
    ] satisfies Medal[]
  ).filter((m) => Number.isFinite(m.entry.value) && m.entry.date);

  const maxRain = Math.max(...r.years.map((y) => y.rain));
  const tMin = Math.min(...r.years.map((y) => y.tempAvg));
  const tMax = Math.max(...r.years.map((y) => y.tempAvg));

  return (
    <>
      <Head>
        <title>Record · Meteo San Martino delle Scale</title>
      </Head>
      <PageHeader title="Record" subtitle={`${fmt(r.days, 0)} giorni misurati dal ${formatArchiveDate(r.since)}`} />

      <div className={`desktop-grid ${styles.layout}`}>
        {r.onThisDay.length > 0 && (
          <Card title="Oggi negli anni passati" icon="history" index={0} className={styles.otdCard}>
            <ul className={styles.otd}>
              {r.onThisDay.map((d) => (
                <li key={d.date}>
                  <span className={styles.otdYear}>{d.year}</span>
                  <span className={styles.otdRange}>
                    <b style={{ color: tempColor(d.tempLow) }}>{fmt(d.tempLow)}°</b>
                    <i style={{ background: `linear-gradient(90deg, ${tempColor(d.tempLow)}, ${tempColor(d.tempHigh)})` }} />
                    <b style={{ color: tempColor(d.tempHigh) }}>{fmt(d.tempHigh)}°</b>
                  </span>
                  <span className={styles.otdRain}>{d.precipTotal >= 0.5 ? `${fmt(d.precipTotal)} mm` : "asciutto"}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className={`${styles.grid} span-all`}>
          {medals.map((m, i) => {
            const { year, month } = parseArchiveDate(m.entry.date);
            return (
              <Link
                key={m.title}
                href={`/storico?anno=${year}&mese=${month}`}
                className={`${styles.medal} reveal`}
                style={{ ["--i" as string]: i + 1, ["--c" as string]: m.color }}
              >
                <span className={styles.medalIcon}>
                  <Icon name={m.icon} size={18} />
                </span>
                <span className={styles.medalTitle}>{m.title}</span>
                <strong className={`${styles.medalValue} tabular`}>
                  {fmt(m.entry.value, m.digits ?? 1)}
                  {/* The degree sign belongs to the number; other units are set smaller. */}
                  {m.unit === "°" ? <span className={styles.deg}>°</span> : <small>{m.unit}</small>}
                </strong>
                <span className={styles.medalDate}>{formatArchiveDate(m.entry.date)}</span>
              </Link>
            );
          })}

          {r.longestDrySpell.days > 0 && (
            <Spell title="Periodo più lungo senza pioggia" spell={r.longestDrySpell} color="#fbbf24" index={medals.length + 1} />
          )}
          {r.longestWetSpell.days > 1 && (
            <Spell title="Giorni di pioggia consecutivi" spell={r.longestWetSpell} color="#6cc4ff" index={medals.length + 2} />
          )}
        </div>

        <Card title="Anno per anno" icon="history" index={medals.length + 3} className={styles.yearsCard}>
          <div className={styles.yearHead}>
            <span />
            <span>Temp. media</span>
            <span>Pioggia (mm)</span>
          </div>
          {r.years.map((y) => (
            <Link key={y.year} href={`/storico?anno=${y.year}&mese=tutto`} className={styles.yearRow}>
              <span className={styles.yearLabel}>
                {y.year}
                {y.days < 360 && <small>{y.days} gg</small>}
              </span>
              <span className={styles.yearBar}>
                <i style={{ width: `${20 + ((y.tempAvg - tMin) / (tMax - tMin || 1)) * 80}%`, background: tempColor(y.tempAvg) }} />
                <b className="tabular">{fmt(y.tempAvg)}°</b>
              </span>
              <span className={styles.yearBar}>
                <i className={styles.rainFill} style={{ width: `${(y.rain / maxRain) * 100}%` }} />
                <b className="tabular">{fmt(y.rain, 0)}</b>
              </span>
            </Link>
          ))}
        </Card>
      </div>
    </>
  );
}

function Spell({
  title,
  spell,
  color,
  index,
}: {
  title: string;
  spell: { days: number; from: string; to: string };
  color: string;
  index: number;
}) {
  return (
    <div className={`${styles.medal} ${styles.wide} reveal`} style={{ ["--i" as string]: index, ["--c" as string]: color }}>
      <span className={styles.medalTitle}>{title}</span>
      <strong className={`${styles.medalValue} tabular`}>
        {spell.days}
        <small> giorni</small>
      </strong>
      <span className={styles.medalDate}>
        dal {formatArchiveDate(spell.from)} al {formatArchiveDate(spell.to)}
      </span>
    </div>
  );
}
