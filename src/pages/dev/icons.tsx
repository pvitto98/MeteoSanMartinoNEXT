import type { GetStaticProps } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { WeatherIcon } from "@/components/sky/WeatherIcon";
import { HourlyStrip } from "@/components/forecast/HourlyStrip";
import { DailyList } from "@/components/forecast/DailyList";
import { stationIsoNow } from "@/lib/format";
import { ICON_KINDS, wmo } from "@/lib/sky";
import type { ForecastDay, ForecastHour } from "@/lib/types";
import styles from "./icons.module.css";

// Development-only page: every icon at every size it is used in, plus links that force each condition app-wide.
export const getStaticProps: GetStaticProps = async () =>
  process.env.NODE_ENV === "production" ? { notFound: true } : { props: {} };

const WMO_CODES = [0, 1, 2, 3, 45, 51, 56, 61, 63, 65, 66, 71, 80, 82, 85, 95, 96];

export default function IconsPreview() {
  const start = stationIsoNow().slice(0, 13);
  const base = new Date(`${start}:00:00Z`).getTime();
  const iso = (h: number) => new Date(base + h * 3600_000).toISOString().slice(0, 16);

  const hours: ForecastHour[] = WMO_CODES.flatMap((code, i) =>
    [true, false].map((isDay, j) => ({
      time: iso(i * 2 + j),
      temperature: 12 + ((i * 3) % 14),
      precipitationProbability: (i * 13) % 100,
      precipitation: code >= 51 ? 1.2 : 0,
      weatherCode: code,
      cloudCover: 50,
      windSpeed: 10,
      windDirection: 200,
      isDay,
    })),
  );
  const days: ForecastDay[] = WMO_CODES.map((code, i) => ({
    date: iso(i * 24).slice(0, 10),
    weatherCode: code,
    tempMax: 18 + (i % 6),
    tempMin: 9 + (i % 4),
    precipitationSum: code >= 51 ? 4 : 0,
    precipitationProbability: (i * 17) % 100,
    sunrise: `${iso(i * 24).slice(0, 10)}T07:05`,
    sunset: `${iso(i * 24).slice(0, 10)}T18:40`,
    uvIndexMax: 4,
    windSpeedMax: 20,
    windGustMax: 35,
  }));

  return (
    <>
      <PageHeader title="Icone meteo" subtitle="Anteprima di sviluppo: ogni icona alle dimensioni usate nell'app." />
      <div className="desktop-grid">
        <Card title="Tutte le condizioni" icon="now" className="span-all">
          <div className={styles.grid}>
            {ICON_KINDS.map((kind) => (
              <Link key={kind} href={`/?forza=${kind}`} className={styles.cell}>
                <div className={styles.hero}>
                  <WeatherIcon kind={kind} size={150} />
                </div>
                <div className={styles.row}>
                  <span className={styles.slot}>
                    <WeatherIcon kind={kind} size={30} still />
                  </span>
                  <span className={styles.slot}>
                    <WeatherIcon kind={kind} size={40} still />
                  </span>
                  <span className={styles.slot}>
                    <WeatherIcon kind={kind} size={40} still />
                  </span>
                </div>
                <code>{kind}</code>
              </Link>
            ))}
          </div>
          <p className={styles.note}>Tocca un&apos;icona per forzare quella condizione su tutta l&apos;app (cielo, intestazione, sfondo animato).</p>
        </Card>

        <Card title="Fasi lunari (sereno di notte)" icon="now" className="span-all">
          <div className={styles.moons}>
            {Array.from({ length: 8 }, (_, i) => (
              <WeatherIcon key={i} kind="clear-night" moonPhase={i / 8} size={72} />
            ))}
          </div>
        </Card>

        <Card title="Codici WMO · ora per ora" icon="forecast" className="span-all">
          <HourlyStrip hours={hours} count={hours.length} />
          <p className={styles.note}>{WMO_CODES.map((c) => `${c} ${wmo(c).label}`).join(" · ")}</p>
        </Card>

        <Card title="Codici WMO · 7 giorni" icon="history" className="span-all">
          <DailyList days={days} />
        </Card>
      </div>
    </>
  );
}
