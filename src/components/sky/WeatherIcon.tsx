import type { IconKind } from "@/lib/sky";
import styles from "./WeatherIcon.module.css";

// Meteocons by Bas Milius (MIT): https://github.com/basmilius/weather-icons
const FILES: Record<IconKind, string> = {
  "clear-day": "clear-day",
  "clear-night": "clear-night",
  "partly-day": "partly-cloudy-day",
  "partly-night": "partly-cloudy-night",
  cloudy: "cloudy",
  overcast: "overcast",
  fog: "fog",
  drizzle: "drizzle",
  rain: "rain",
  "showers-day": "partly-cloudy-day-rain",
  "showers-night": "partly-cloudy-night-rain",
  storm: "thunderstorms-rain",
  "storm-dry": "thunderstorms",
  snow: "snow",
  sleet: "sleet",
};

const MOON_PHASES = [
  "clear-night", // new moon: the starry icon reads better than a dark disc
  "moon-waxing-crescent",
  "moon-first-quarter",
  "moon-waxing-gibbous",
  "moon-full",
  "moon-waning-gibbous",
  "moon-last-quarter",
  "moon-waning-crescent",
];

interface Props {
  kind: IconKind;
  size?: number;
  /** Static artwork for dense lists (no animation, cheaper to render). */
  still?: boolean;
  /** 0–1 moon phase from SunCalc: clear nights then show the real moon. */
  moonPhase?: number;
  title?: string;
}

export function WeatherIcon({ kind, size = 64, still = false, moonPhase, title }: Props) {
  // Show the real moon on clear nights, except around new moon when the disc would be almost invisible.
  const phaseIndex = moonPhase === undefined ? 0 : Math.round(moonPhase * 8) % 8;
  const file = kind === "clear-night" && phaseIndex !== 0 ? MOON_PHASES[phaseIndex] : FILES[kind];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/icons/weather/${still ? "static" : "anim"}/${file}.svg`}
      width={size}
      height={size}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      className={styles.icon}
      draggable={false}
      decoding="async"
    />
  );
}
