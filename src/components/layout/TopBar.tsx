import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { WeatherIcon } from "@/components/sky/WeatherIcon";
import { STATION } from "@/lib/config";
import { fmt } from "@/lib/format";
import { useScene } from "@/lib/hooks";
import styles from "./TopBar.module.css";

/**
 * Transparent over the hero; once the hero scrolls away it condenses into a
 * glass bar that keeps the live temperature visible.
 */
export function TopBar({ title }: { title?: string }) {
  const { now, condition } = useScene();
  const isHome = useRouter().pathname === "/";
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On the home page the hero already shows the temperature.
  const showLive = !isHome || scrollY > 180;
  const condensed = isHome ? scrollY > 180 : scrollY > 8;

  return (
    <header className={`${styles.bar} ${condensed ? styles.condensed : ""} ${showLive ? styles.showLive : ""}`}>
      <div className={styles.inner}>
        <div className={styles.place}>
          <span className={styles.kicker}>{title ?? "Meteo"}</span>
          <span className={styles.name}>{STATION.name}</span>
        </div>
        {now && condition && (
          <div className={styles.live} aria-hidden={!showLive}>
            <WeatherIcon kind={condition.kind} size={30} still />
            <span className={`${styles.temp} tabular`}>{fmt(now.outdoor.temperature)}°</span>
          </div>
        )}
      </div>
    </header>
  );
}
