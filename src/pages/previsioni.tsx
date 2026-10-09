import Head from "next/head";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { HourlyStrip } from "@/components/forecast/HourlyStrip";
import { DailyList } from "@/components/forecast/DailyList";
import { RainOutlook } from "@/components/forecast/RainOutlook";
import { fmt } from "@/lib/format";
import { useForecast, useStationNow } from "@/lib/hooks";
import styles from "./previsioni.module.css";

export default function ForecastPage() {
  const { data: forecast, error } = useForecast();
  const { data: now } = useStationNow();

  const bias = now && forecast ? now.outdoor.temperature - forecast.current.temperature : null;

  return (
    <>
      <Head>
        <title>Previsioni · Meteo San Martino delle Scale</title>
      </Head>
      <PageHeader title="Previsioni" subtitle="Le prossime ore e i prossimi 7 giorni a San Martino delle Scale" />

      {error && !forecast && (
        <Card title="Previsioni non disponibili" icon="offline">
          <p>Il servizio di previsione non risponde. Riprova tra qualche minuto.</p>
        </Card>
      )}

      {!forecast && !error && (
        <div className={styles.stack}>
          <div className="skeleton" style={{ height: 170, borderRadius: 26 }} />
          <div className="skeleton" style={{ height: 420, borderRadius: 26 }} />
        </div>
      )}

      {forecast && (
        <div className="desktop-grid">
          <Card title="Ora per ora" icon="forecast" index={0} className="span-all">
            <HourlyStrip hours={forecast.hourly} count={48} />
          </Card>

          <Card title="7 giorni" icon="history" index={1} aside="tocca un giorno">
            <DailyList days={forecast.daily} current={now?.outdoor.temperature} />
          </Card>

          <div className={styles.stack}>
            <Card title="Pioggia prevista" icon="drop" index={2}>
              <RainOutlook hours={forecast.hourly} />
            </Card>

            {bias !== null && (
              <Card title="Stazione vs modello" icon="station" index={3}>
                <div className={styles.compare}>
                  <div>
                    <span>Misurata</span>
                    <strong className="tabular">{fmt(now!.outdoor.temperature)}°</strong>
                  </div>
                  <div className={styles.delta}>
                    <span className="tabular">
                      {bias > 0 ? "+" : ""}
                      {fmt(bias)}°
                    </span>
                  </div>
                  <div>
                    <span>Modello</span>
                    <strong className="tabular">{fmt(forecast.current.temperature)}°</strong>
                  </div>
                </div>
                <p className={styles.note}>
                  {Math.abs(bias) < 0.8
                    ? "Il modello sta azzeccando la temperatura di San Martino."
                    : bias > 0
                      ? "Qui fa più caldo di quanto preveda il modello: tienine conto per le massime."
                      : "Qui fa più fresco di quanto preveda il modello: la quota e il bosco si fanno sentire."}
                </p>
              </Card>
            )}
          </div>

          <p className={`${styles.credits} span-all`}>
            Previsioni:{" "}
            <a href="https://open-meteo.com" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>{" "}
            (modelli ICON, ECMWF, GFS) · licenza CC BY 4.0
          </p>
        </div>
      )}
    </>
  );
}
