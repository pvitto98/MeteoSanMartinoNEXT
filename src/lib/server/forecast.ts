import { STATION } from "@/lib/config";
import type { Forecast } from "@/lib/types";

const HOURLY = [
  "temperature_2m",
  "precipitation_probability",
  "precipitation",
  "weather_code",
  "cloud_cover",
  "wind_speed_10m",
  "wind_direction_10m",
  "is_day",
] as const;

const DAILY = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "precipitation_probability_max",
  "sunrise",
  "sunset",
  "uv_index_max",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
] as const;

/** 7-day forecast from Open-Meteo (free, no key), already in local time. */
export async function getForecast(): Promise<Forecast> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(STATION.lat),
    longitude: String(STATION.lon),
    elevation: String(STATION.altitude),
    timezone: STATION.timezone,
    forecast_days: "8",
    current: "temperature_2m,cloud_cover,weather_code,is_day",
    hourly: HOURLY.join(","),
    daily: DAILY.join(","),
  }).toString();

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  const j = await res.json();

  const h = j.hourly;
  const d = j.daily;
  return {
    current: {
      temperature: j.current.temperature_2m,
      cloudCover: j.current.cloud_cover,
      weatherCode: j.current.weather_code,
      isDay: j.current.is_day === 1,
    },
    hourly: (h.time as string[]).map((time, i) => ({
      time,
      temperature: h.temperature_2m[i],
      precipitationProbability: h.precipitation_probability[i] ?? 0,
      precipitation: h.precipitation[i] ?? 0,
      weatherCode: h.weather_code[i],
      cloudCover: h.cloud_cover[i],
      windSpeed: h.wind_speed_10m[i],
      windDirection: h.wind_direction_10m[i],
      isDay: h.is_day[i] === 1,
    })),
    daily: (d.time as string[]).map((date, i) => ({
      date,
      weatherCode: d.weather_code[i],
      tempMax: d.temperature_2m_max[i],
      tempMin: d.temperature_2m_min[i],
      precipitationSum: d.precipitation_sum[i] ?? 0,
      precipitationProbability: d.precipitation_probability_max[i] ?? 0,
      sunrise: d.sunrise[i],
      sunset: d.sunset[i],
      uvIndexMax: d.uv_index_max[i] ?? 0,
      windSpeedMax: d.wind_speed_10m_max[i] ?? 0,
      windGustMax: d.wind_gusts_10m_max[i] ?? 0,
    })),
  };
}
