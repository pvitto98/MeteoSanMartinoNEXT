import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { LIVE_REFRESH_MS } from "@/lib/config";
import { useRouter } from "next/router";
import { deriveCondition, ICON_KINDS, skyPalette, sunAltitude, type Condition, type IconKind } from "@/lib/sky";
import type { DailyRecord, Forecast, Records, StationNow, StationToday } from "@/lib/types";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

export const useStationNow = () =>
  useSWR<StationNow>("/api/station/now", fetcher, { refreshInterval: LIVE_REFRESH_MS, revalidateOnFocus: true });

export const useStationToday = () =>
  useSWR<StationToday>("/api/station/today", fetcher, { refreshInterval: 5 * 60_000 });

export const useForecast = () => useSWR<Forecast>("/api/forecast", fetcher, { refreshInterval: 15 * 60_000 });

export const useRecords = () => useSWR<Records>("/api/records", fetcher, { revalidateOnFocus: false });

export const useYears = () =>
  useSWR<{ years: string[] }>("/api/metadata", fetcher, { revalidateOnFocus: false });

/** Pass `enabled: false` until the selection is known (e.g. before the router has read the URL). */
export function useArchive(year: number, month?: number, enabled = true) {
  const q = new URLSearchParams({ year: String(year) });
  if (month) q.set("month", String(month));
  return useSWR<{ weatherData: DailyRecord[] }>(enabled ? `/api/weather?${q}` : null, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

/** Re-renders every `ms` so relative times and the sun position stay fresh. */
export function useClock(ms = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

// Development aid: `?forza=rain` (any IconKind) forces that condition across the UI.
const FORCED: Partial<Record<IconKind, Pick<Condition, "label" | "cloudiness" | "rainRate">>> = {
  "clear-day": { label: "Sereno", cloudiness: 0, rainRate: 0 },
  "clear-night": { label: "Sereno", cloudiness: 0, rainRate: 0 },
  "partly-day": { label: "Poco nuvoloso", cloudiness: 0.35, rainRate: 0 },
  "partly-night": { label: "Poco nuvoloso", cloudiness: 0.35, rainRate: 0 },
  cloudy: { label: "Nuvoloso", cloudiness: 0.65, rainRate: 0 },
  overcast: { label: "Coperto", cloudiness: 0.95, rainRate: 0 },
  fog: { label: "Nebbia", cloudiness: 0.9, rainRate: 0 },
  drizzle: { label: "Pioviggine", cloudiness: 1, rainRate: 0.3 },
  rain: { label: "Pioggia moderata", cloudiness: 1, rainRate: 5 },
  "showers-day": { label: "Rovesci", cloudiness: 0.7, rainRate: 3 },
  "showers-night": { label: "Rovesci", cloudiness: 0.7, rainRate: 3 },
  storm: { label: "Temporale", cloudiness: 1, rainRate: 18 },
  "storm-dry": { label: "Fulmini vicini", cloudiness: 1, rainRate: 0 },
  snow: { label: "Neve", cloudiness: 1, rainRate: 1 },
  sleet: { label: "Pioggia mista a neve", cloudiness: 1, rainRate: 1 },
};

function useForcedKind(): IconKind | null {
  const { query } = useRouter();
  if (process.env.NODE_ENV === "production") return null;
  const k = typeof query.forza === "string" ? (query.forza as IconKind) : null;
  return k && ICON_KINDS.includes(k) ? k : null;
}

/** Everything the UI needs to paint the current sky. */
export function useScene() {
  const { data: now } = useStationNow();
  const { data: today } = useStationToday();
  const { data: forecast } = useForecast();
  const clock = useClock(60_000);
  const forced = useForcedKind();

  return useMemo(() => {
    const altitude = sunAltitude(clock);
    let condition = now ? deriveCondition(now, today, forecast, clock) : null;
    if (condition && forced) condition = { ...condition, kind: forced, ...FORCED[forced] };
    const palette = skyPalette(altitude, condition?.cloudiness ?? 0.3, (condition?.rainRate ?? 0) > 0);
    return { now, today, forecast, condition, palette, altitude };
  }, [now, today, forecast, clock, forced]);
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
