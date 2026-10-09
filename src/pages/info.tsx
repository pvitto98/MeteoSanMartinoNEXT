import { useEffect, useState } from "react";
import Head from "next/head";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/layout/PageHeader";
import { STATION } from "@/lib/config";
import { detectPlatform, getConsent, openConsentSheet, openInstallSheet } from "@/lib/pwa";
import styles from "./info.module.css";

const SENSORS = [
  "Temperatura, umidità e punto di rugiada",
  "Vento: velocità, raffica e direzione",
  "Pluviometro e intensità di pioggia",
  "Radiazione solare e indice UV",
  "Pressione atmosferica",
  "Particolato PM2.5",
  "Rilevatore di fulmini (fino a 40 km)",
];

export default function InfoPage() {
  const [standalone, setStandalone] = useState(true);
  const [consent, setConsentState] = useState<string | null>(null);

  useEffect(() => {
    setStandalone(detectPlatform().standalone);
    setConsentState(getConsent());
    const refresh = () => setConsentState(getConsent());
    window.addEventListener("msm:consent-changed", refresh);
    return () => window.removeEventListener("msm:consent-changed", refresh);
  }, []);

  return (
    <>
      <Head>
        <title>Info · Meteo San Martino delle Scale</title>
      </Head>
      <PageHeader title="Info" subtitle="Il meteo di San Martino delle Scale, misurato qui." />

      <div className="desktop-grid">
        {!standalone && (
          <button className={`${styles.install} reveal span-all`} onClick={openInstallSheet}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/badge.png" alt="" width={48} height={48} />
            <span>
              <strong>Installa l&apos;app</strong>
              <small>Aggiungi Meteo San Martino alla schermata Home</small>
            </span>
            <Icon name="chevronRight" size={20} />
          </button>
        )}

        <Card title="San Martino delle Scale" icon="now" index={1}>
          <p className={styles.p}>
            Frazione di Monreale a circa {STATION.altitude} metri sui monti sopra Palermo, cresciuta attorno all&apos;
            <strong>Abbazia benedettina</strong> che ospita l&apos;Accademia di Belle Arti e una scuola di restauro. Boschi e quota la
            rendono il rifugio fresco dei palermitani d&apos;estate, e un posto dal meteo tutto suo d&apos;inverno.
          </p>
        </Card>

        <Card title="La stazione" icon="station" index={2}>
          <p className={styles.p}>
            Una stazione Ecowitt invia i dati ogni minuto. Lo stato del cielo non viene indovinato: lo calcoliamo confrontando la luce
            misurata dal sensore solare con quella teorica di un cielo sereno.
          </p>
          <ul className={styles.sensors}>
            {SENSORS.map((s) => (
              <li key={s}>
                <Icon name="chevronRight" size={14} strokeWidth={2.4} />
                {s}
              </li>
            ))}
          </ul>
          <p className={styles.small}>
            Previsioni da Open-Meteo · archivio giornaliero dal 2021 · coordinate {STATION.lat.toFixed(3)}°N, {STATION.lon.toFixed(3)}°E ·
            icone{" "}
            <a href="https://github.com/basmilius/weather-icons" target="_blank" rel="noreferrer">
              Meteocons
            </a>{" "}
            di Bas Milius (MIT)
          </p>
        </Card>

        <Card title="Grazie" icon="heart" index={3}>
          <p className={styles.p}>
            Un ringraziamento speciale ad <strong>Alessandro Messina</strong>, che ha messo a disposizione la stazione, e a{" "}
            <strong>Marco Messina</strong> per l&apos;aiuto nell&apos;analisi dei dati.
          </p>
          <div className={styles.buttons}>
            <a href="https://vittoriopellittieri.netlify.app/" target="_blank" rel="noreferrer" className={styles.button}>
              Chi ha creato l&apos;app <Icon name="external" size={15} />
            </a>
            <a
              href="https://www.paypal.me/PietroPPellittieri"
              target="_blank"
              rel="noreferrer"
              className={`${styles.button} ${styles.primary}`}
            >
              <Icon name="heart" size={16} /> Sostieni il progetto
            </a>
          </div>
        </Card>

        <Card title="Privacy" icon="shield" index={4}>
          <p className={styles.p}>
            Statistiche anonime: <strong>{consent === "granted" ? "attive" : "disattivate"}</strong>. Nessuna pubblicità e nessun profilo; i
            dati della stazione restano pubblici.
          </p>
          <button className={styles.button} onClick={openConsentSheet}>
            Modifica preferenze
          </button>
        </Card>
      </div>
    </>
  );
}
