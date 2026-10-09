import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { TempBandChart } from "@/components/history/TempBandChart";
import { RainBars } from "@/components/history/RainBars";
import { MonthCalendar, YearHeatmap } from "@/components/history/Calendar";
import { DaySheet } from "@/components/history/DaySheet";
import { dailyBuckets, monthlyBuckets, summarize } from "@/lib/archive";
import { cardinal, fmt, formatArchiveDate, MONTHS, MONTHS_SHORT, tempColor } from "@/lib/format";
import { useArchive, useYears } from "@/lib/hooks";
import type { DailyRecord } from "@/lib/types";
import styles from "./storico.module.css";

export default function HistoryPage() {
  const router = useRouter();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // Selection lives in the URL so it can be shared (?anno=2024&mese=7).
  const year = Number(router.query.anno) || currentYear;
  const month = router.query.mese === "tutto" ? undefined : Number(router.query.mese) || (router.query.anno ? undefined : currentMonth);
  const select = (y: number, m?: number) =>
    router.replace({ query: { anno: y, mese: m ?? "tutto" } }, undefined, { shallow: true, scroll: false });

  const { data: meta } = useYears();
  const { data, isLoading } = useArchive(year, month, router.isReady);
  const [day, setDay] = useState<DailyRecord | null>(null);

  const days = useMemo(() => data?.weatherData ?? [], [data]);
  const summary = useMemo(() => summarize(days), [days]);
  const buckets = useMemo(() => (month ? dailyBuckets(days) : monthlyBuckets(days)), [days, month]);
  const years = (meta?.years ?? [String(currentYear)]).map(Number);

  // Keep the active chips in view.
  const yearsRef = useRef<HTMLDivElement>(null);
  const monthsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    for (const el of [yearsRef.current, monthsRef.current]) {
      el?.querySelector<HTMLElement>("[aria-pressed=true]")?.scrollIntoView({ inline: "center", block: "nearest" });
    }
  }, [year, month, meta]);

  const periodLabel = month ? `${MONTHS[month - 1]} ${year}` : `Anno ${year}`;

  return (
    <>
      <Head>
        <title>Storico · Meteo San Martino delle Scale</title>
      </Head>
      <PageHeader title="Storico" subtitle="Ogni giorno misurato dalla stazione, dal 2021 a oggi" />

      <div className={styles.filters}>
        <div ref={yearsRef} className={`${styles.chips} h-scroll`} role="group" aria-label="Anno">
          {years.map((y) => (
            <button
              key={y}
              className={styles.chip}
              aria-pressed={y === year}
              onClick={() => select(y, month && (y < currentYear || month <= currentMonth) ? month : undefined)}
            >
              {y}
            </button>
          ))}
        </div>
        <div ref={monthsRef} className={`${styles.chips} h-scroll`} role="group" aria-label="Mese">
          <button className={styles.chip} aria-pressed={!month} onClick={() => select(year)}>
            Tutto l&apos;anno
          </button>
          {MONTHS_SHORT.map((m, i) => (
            <button
              key={m}
              className={styles.chip}
              aria-pressed={month === i + 1}
              disabled={year === currentYear && i + 1 > currentMonth}
              onClick={() => select(year, i + 1)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {!summary && (isLoading || !router.isReady) && (
        <div className={styles.stack}>
          <div className="skeleton" style={{ height: 150, borderRadius: 26 }} />
          <div className="skeleton" style={{ height: 260, borderRadius: 26 }} />
        </div>
      )}

      {!summary && !isLoading && router.isReady && (
        <Card title={periodLabel} icon="history">
          <p>Nessun dato registrato per questo periodo.</p>
        </Card>
      )}

      {summary && (
        <div className={`desktop-grid ${isLoading ? styles.loading : ""}`}>
          <Card title={periodLabel} icon="history" index={0} aside={`${summary.days} giorni`} className="span-all">
            <div className={styles.stats}>
              <Stat label="Media" value={`${fmt(summary.tempAvg)}°`} color={tempColor(summary.tempAvg)} />
              <Stat
                label="Massima"
                value={`${fmt(summary.tempHigh.value)}°`}
                sub={formatArchiveDate(summary.tempHigh.date, false)}
                color={tempColor(summary.tempHigh.value)}
              />
              <Stat
                label="Minima"
                value={`${fmt(summary.tempLow.value)}°`}
                sub={formatArchiveDate(summary.tempLow.date, false)}
                color={tempColor(summary.tempLow.value)}
              />
              <Stat
                label="Pioggia"
                value={`${fmt(summary.rain, 0)} mm`}
                sub={summary.rainyDays === 1 ? "1 giorno di pioggia" : `${summary.rainyDays} giorni di pioggia`}
              />
              <Stat label="Raffica max" value={`${fmt(summary.gust.value, 0)} km/h`} sub={formatArchiveDate(summary.gust.date, false)} />
              <Stat
                label="Vento prevalente"
                value={cardinal(summary.windDir)}
                sub={summary.lightning ? `${fmt(summary.lightning, 0)} fulmini` : undefined}
              />
            </div>
          </Card>

          <Card title="Temperature" icon="thermometer" index={1} className="span-all">
            <TempBandChart buckets={buckets} onSelect={(b) => setDay(b.days[0])} />
          </Card>

          <Card title="Pioggia" icon="drop" index={2}>
            <RainBars buckets={buckets} />
          </Card>

          <Card
            title={month ? "Calendario" : "Giorno per giorno"}
            icon="now"
            index={3}
            aside="tocca un giorno"
            className={month ? "" : "span-all"}
          >
            {month ? (
              <MonthCalendar year={year} month={month} days={days} onSelect={setDay} />
            ) : (
              <YearHeatmap year={year} days={days} onSelect={setDay} />
            )}
          </Card>
        </div>
      )}

      <DaySheet day={day} onClose={() => setDay(null)} />
    </>
  );
}

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <strong className="tabular" style={{ color }}>
        {value}
      </strong>
      {sub && <span className={styles.statSub}>{sub}</span>}
    </div>
  );
}
