export const STATION = {
  name: "San Martino delle Scale",
  shortName: "San Martino",
  municipality: "Monreale (PA)",
  lat: 38.088778,
  lon: 13.250223,
  altitude: 550,
  timezone: "Europe/Rome",
  ecowittMac: "54:32:04:43:1E:24",
  wundergroundId: "IMONRE13",
} as const;

export const SITE = {
  title: "Meteo San Martino delle Scale",
  description:
    "Dati meteo in tempo reale dalla stazione di San Martino delle Scale: temperatura, vento, pioggia, sole, qualità dell'aria, previsioni e storico.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://meteo-san-martino-next.vercel.app",
};

/** Refresh cadence for the live station data (the station uploads roughly every minute). */
export const LIVE_REFRESH_MS = 60_000;
