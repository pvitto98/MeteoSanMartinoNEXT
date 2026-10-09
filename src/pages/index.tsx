import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { DayTemperatureChart } from "@/components/charts/DayTemperatureChart";
import { HourlyStrip } from "@/components/forecast/HourlyStrip";
import { Hero, HeroSkeleton } from "@/components/now/Hero";
import { WindCard } from "@/components/now/WindCard";
import { RainCard } from "@/components/now/RainCard";
import { SunCard } from "@/components/now/SunCard";
import { AirCard, HumidityCard, LightningCard, PressureCard, showsLightning, UvCard } from "@/components/now/SmallCards";
import { STATION } from "@/lib/config";
import { fmt, stationMidnight, stationTimeToMs } from "@/lib/format";
import { useClock, useScene, useStationNow } from "@/lib/hooks";
import styles from "./index.module.css";

export default function NowPage() {
  const { now, today, forecast, condition } = useScene();
  const { error } = useStationNow();
  const clock = useClock(15_000);

  if (!now || !condition) {
    return (
      <div className={styles.home}>
        {error ? (
          <Card title="Stazione non raggiungibile" icon="offline">
            <p>Non riusciamo a leggere i dati in questo momento. Riproveremo automaticamente tra poco.</p>
          </Card>
        ) : (
          <HeroSkeleton />
        )}
      </div>
    );
  }

  const dayStart = stationMidnight(clock);
  const dayEnd = dayStart + 24 * 3600_000;
  const forecastToday = (forecast?.hourly ?? []).map((h) => ({ t: stationTimeToMs(h.time), v: h.temperature }));
  let i = 0;
  // On desktop every tile below the forecast is half width: fill an odd slot with the station card.
  const halfTiles = 6 + (now.air.aqi !== null ? 1 : 0) + (showsLightning(now, clock) ? 1 : 0);

  return (
    <div className={styles.home}>
      <div className={styles.heroCol}>
        <Hero now={now} today={today} forecast={forecast} condition={condition} clock={clock} />
      </div>

      <div className={styles.grid}>
        <Card title="Oggi" icon="thermometer" wide index={i++} aside={forecast ? "misurata · prevista" : undefined}>
          {today ? (
            <DayTemperatureChart
              measured={today.temperature.filter((p) => p.t >= dayStart)}
              forecast={forecastToday}
              dayStart={dayStart}
              dayEnd={dayEnd}
            />
          ) : (
            <div className="skeleton" style={{ height: 150 }} />
          )}
        </Card>

        {forecast && (
          <Card
            title="Prossime ore"
            icon="forecast"
            wide
            index={i++}
            aside={
              <Link href="/previsioni" className={styles.more}>
                7 giorni <Icon name="chevronRight" size={14} />
              </Link>
            }
          >
            <HourlyStrip hours={forecast.hourly} from={clock} />
          </Card>
        )}

        <WindCard now={now} today={today} index={i++} />
        <RainCard now={now} index={i++} />
        <SunCard now={now} condition={condition} clock={clock} index={i++} />
        <UvCard now={now} today={today} index={i++} />
        <AirCard now={now} index={i++} />
        <PressureCard now={now} today={today} index={i++} />
        <HumidityCard now={now} today={today} index={i++} />
        <LightningCard now={now} clock={clock} index={i++} />

        {halfTiles % 2 === 1 && (
          <Card title="Stazione" icon="station" index={i++} className={styles.desktopOnly}>
            <p className={styles.stationText}>
              Ecowitt WS3900 a {STATION.altitude} m, dati ogni minuto.
              {now.indoor.temperature !== null && <> Interno {fmt(now.indoor.temperature)}°.</>}
            </p>
            <Link href="/info" className={styles.more}>
              Come funziona <Icon name="chevronRight" size={14} />
            </Link>
          </Card>
        )}

        <footer className={styles.footer}>
          <Icon name="station" size={16} />
          <p>
            Stazione Ecowitt di {STATION.name}, {STATION.altitude} m · aggiornamento ogni minuto
            {now.indoor.temperature !== null && <> · interno {fmt(now.indoor.temperature)}°</>}
            {condition.source === "sensore" && " · cielo stimato dal sensore solare"}
          </p>
        </footer>
      </div>
    </div>
  );
}
