import { fmt, rainIntensity, stationIsoNow, stationTimeToMs } from "@/lib/format";
import type { Forecast, StationNow, StationToday } from "@/lib/types";

/** One human sentence about what matters right now. */
export function insight(now: StationNow, today: StationToday | undefined, forecast: Forecast | undefined, at = new Date()): string {
  if (now.rain.rate > 0) {
    return `${rainIntensity(now.rain.rate)}: ${fmt(now.rain.daily)} mm caduti oggi.`;
  }
  const upcoming = forecast?.hourly.filter((h) => {
    const t = stationTimeToMs(h.time);
    return t > at.getTime() && t < at.getTime() + 6 * 3600_000;
  });
  const wet = upcoming?.find((h) => h.precipitationProbability >= 50);
  if (wet) {
    return `Pioggia probabile verso le ${wet.time.slice(11, 13)} (${wet.precipitationProbability}%).`;
  }
  if (now.wind.gust >= 50) return `Raffiche fino a ${fmt(now.wind.gust, 0)} km/h: attenzione all'aperto.`;
  if (now.outdoor.temperature <= 2) return "Possibili gelate: copri le piante e attenzione alle strade.";

  const temps = today?.temperature ?? [];
  if (temps.length > 12) {
    const hourAgo = temps.find((p) => p.t >= now.updatedAt - 3600_000);
    if (hourAgo) {
      const delta = now.outdoor.temperature - hourAgo.v;
      if (Math.abs(delta) >= 1.5) return `${delta > 0 ? "In salita" : "In calo"} di ${fmt(Math.abs(delta))}° nell'ultima ora.`;
    }
  }
  const todayForecast = forecast?.daily[0];
  if (todayForecast && stationIsoNow(at).slice(11, 13) < "14") return `Massima prevista oggi ${fmt(todayForecast.tempMax, 0)}°.`;
  const tomorrow = forecast?.daily[1];
  if (tomorrow) return `Domani tra ${fmt(tomorrow.tempMin, 0)}° e ${fmt(tomorrow.tempMax, 0)}°.`;
  return "Dati in tempo reale dalla stazione di San Martino.";
}
