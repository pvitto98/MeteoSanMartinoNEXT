import { STATION } from "@/lib/config";

const numberFormats = new Map<number, Intl.NumberFormat>();

/** Italian number formatting (decimal comma). */
export function fmt(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "–";
  let f = numberFormats.get(digits);
  if (!f) {
    f = new Intl.NumberFormat("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: digits });
    numberFormats.set(digits, f);
  }
  // Avoid "-0"
  return f.format(Math.abs(value) < 10 ** -digits / 2 ? 0 : value);
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ───────────────────────── Wind ───────────────────────── */

const CARDINALS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
export const cardinal = (deg: number) => CARDINALS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];

// The Mediterranean wind rose, as every Sicilian knows it.
const WIND_NAMES = ["Tramontana", "Grecale", "Levante", "Scirocco", "Ostro", "Libeccio", "Ponente", "Maestrale"];
export const windName = (deg: number) => WIND_NAMES[Math.round((((deg % 360) + 360) % 360) / 45) % 8];

const BEAUFORT: [number, string][] = [
  [1, "Calma"],
  [6, "Bava di vento"],
  [12, "Brezza leggera"],
  [20, "Brezza tesa"],
  [29, "Vento moderato"],
  [39, "Vento teso"],
  [50, "Vento fresco"],
  [62, "Vento forte"],
  [75, "Burrasca"],
  [89, "Burrasca forte"],
  [103, "Tempesta"],
  [118, "Fortunale"],
  [Infinity, "Uragano"],
];
export function beaufort(kmh: number) {
  const force = BEAUFORT.findIndex(([max]) => kmh < max);
  return { force, label: BEAUFORT[force][1] };
}

/** Mean of angles: averaging 350° and 10° must give 0°, not 180°. */
export function circularMean(degrees: number[]): number {
  if (!degrees.length) return NaN;
  let x = 0;
  let y = 0;
  for (const d of degrees) {
    x += Math.cos((d * Math.PI) / 180);
    y += Math.sin((d * Math.PI) / 180);
  }
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/* ───────────────────────── Scales ───────────────────────── */

export interface Level {
  label: string;
  color: string;
  advice?: string;
}

export function uvLevel(uvi: number): Level {
  if (uvi < 3) return { label: "Basso", color: "#4ade80", advice: "Nessuna protezione necessaria" };
  if (uvi < 6) return { label: "Moderato", color: "#facc15", advice: "Occhiali da sole e crema SPF 30" };
  if (uvi < 8) return { label: "Alto", color: "#fb923c", advice: "SPF 50, cappello, ombra a mezzogiorno" };
  if (uvi < 11) return { label: "Molto alto", color: "#ef4444", advice: "Evita il sole tra le 11 e le 16" };
  return { label: "Estremo", color: "#a855f7", advice: "Resta all'ombra" };
}

/** US AQI bands, as reported by the Ecowitt PM2.5 sensor. */
export function aqiLevel(aqi: number): Level {
  if (aqi <= 50) return { label: "Buona", color: "#4ade80", advice: "Aria pulita, ideale per stare all'aperto" };
  if (aqi <= 100) return { label: "Discreta", color: "#facc15", advice: "Accettabile per quasi tutti" };
  if (aqi <= 150) return { label: "Mediocre", color: "#fb923c", advice: "Le persone sensibili limitino gli sforzi" };
  if (aqi <= 200) return { label: "Scadente", color: "#ef4444", advice: "Riduci l'attività all'aperto" };
  if (aqi <= 300) return { label: "Pessima", color: "#a855f7", advice: "Evita l'attività all'aperto" };
  return { label: "Pericolosa", color: "#9f1239", advice: "Resta al chiuso" };
}

export function dewComfort(dewPoint: number): string {
  if (dewPoint < 10) return "Aria secca";
  if (dewPoint < 13) return "Confortevole";
  if (dewPoint < 16) return "Piacevole";
  if (dewPoint < 18) return "Un po' umido";
  if (dewPoint < 21) return "Afoso";
  return "Opprimente";
}

export function rainIntensity(mmh: number): string {
  if (mmh <= 0) return "Nessuna pioggia";
  if (mmh < 2.5) return "Pioggia debole";
  if (mmh < 7.6) return "Pioggia moderata";
  if (mmh < 50) return "Pioggia forte";
  return "Nubifragio";
}

const TEMP_STOPS: [number, [number, number, number]][] = [
  [-5, [99, 102, 241]],
  [0, [59, 130, 246]],
  [8, [34, 211, 238]],
  [15, [74, 222, 128]],
  [21, [250, 204, 21]],
  [27, [251, 146, 60]],
  [33, [239, 68, 68]],
  [40, [190, 24, 93]],
];

/** Continuous temperature colour scale used by every chart. */
export function tempColor(t: number): string {
  if (!Number.isFinite(t)) return "rgb(148,163,184)";
  if (t <= TEMP_STOPS[0][0]) return `rgb(${TEMP_STOPS[0][1].join(",")})`;
  for (let i = 1; i < TEMP_STOPS.length; i++) {
    const [t1, c1] = TEMP_STOPS[i];
    if (t <= t1) {
      const [t0, c0] = TEMP_STOPS[i - 1];
      const k = (t - t0) / (t1 - t0);
      return `rgb(${c0.map((c, j) => Math.round(lerp(c, c1[j], k))).join(",")})`;
    }
  }
  return `rgb(${TEMP_STOPS[TEMP_STOPS.length - 1][1].join(",")})`;
}

/* ───────────────────────── Dates ───────────────────────── */

export const MONTHS = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
export const MONTHS_SHORT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
export const WEEKDAYS_SHORT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

const tz = { timeZone: STATION.timezone };

export const formatTime = (d: Date | number) =>
  new Date(d).toLocaleTimeString("it-IT", { ...tz, hour: "2-digit", minute: "2-digit" });

export const formatHour = (d: Date | number) => new Date(d).toLocaleTimeString("it-IT", { ...tz, hour: "2-digit" });

export const formatLongDate = (d: Date | number) =>
  capitalize(new Date(d).toLocaleDateString("it-IT", { ...tz, weekday: "long", day: "numeric", month: "long" }));

export const formatWeekday = (d: Date | number, style: "long" | "short" = "long") =>
  capitalize(new Date(d).toLocaleDateString("it-IT", { ...tz, weekday: style }));

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Archive dates are "YYYYMMDD" strings. */
export function parseArchiveDate(s: string) {
  return { year: +s.slice(0, 4), month: +s.slice(4, 6), day: +s.slice(6, 8) };
}

export function formatArchiveDate(s: string, withYear = true) {
  if (!s) return "–";
  const { year, month, day } = parseArchiveDate(s);
  return `${day} ${MONTHS[month - 1].toLowerCase()}${withYear ? ` ${year}` : ""}`;
}

export function relativeTime(fromMs: number, nowMs = Date.now()): string {
  const s = Math.max(0, Math.round((nowMs - fromMs) / 1000));
  if (s < 45) return "adesso";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min fa`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ${h === 1 ? "ora" : "ore"} fa`;
  const d = Math.round(h / 24);
  return `${d} ${d === 1 ? "giorno" : "giorni"} fa`;
}

/* Open-Meteo returns station-local wall-clock strings ("2026-10-09T14:00"). */

/** Current station-local time in the same "YYYY-MM-DDTHH:mm" shape, for string comparisons. */
export function stationIsoNow(d = new Date()) {
  const p = new Intl.DateTimeFormat("en-CA", {
    ...tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "00";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour").replace("24", "00")}:${g("minute")}`;
}

/** Weekday for a "YYYY-MM-DD" calendar date, independent of the viewer's timezone. */
export function weekdayOf(date: string, style: "long" | "short" = "long") {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  return capitalize(new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("it-IT", { timeZone: "UTC", weekday: style }));
}

export function dayMonthOf(date: string) {
  const [, m, d] = date.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1].toLowerCase()}`;
}

/** Epoch ms of a station-local wall-clock string. */
export function stationTimeToMs(local: string) {
  const [datePart, timePart = "00:00"] = local.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  // Find the station's UTC offset at that moment.
  const asLocal = stationIsoNow(new Date(guess));
  const [ld, lt] = asLocal.split("T");
  const [ly, lm, ldd] = ld.split("-").map(Number);
  const [lh, lmin] = lt.split(":").map(Number);
  const offset = Date.UTC(ly, lm - 1, ldd, lh, lmin) - guess;
  return guess - offset;
}

/** Epoch ms of the station's local midnight for the given instant. */
export const stationMidnight = (d = new Date()) => stationTimeToMs(`${stationIsoNow(d).slice(0, 10)}T00:00`);
