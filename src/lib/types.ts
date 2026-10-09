/** Live snapshot of the station, normalised to metric numbers (°C, km/h, mm, hPa). */
export interface StationNow {
  updatedAt: number; // epoch ms of the latest reading
  outdoor: {
    temperature: number;
    feelsLike: number;
    dewPoint: number;
    humidity: number;
  };
  indoor: { temperature: number | null; humidity: number | null };
  wind: {
    speed: number;
    gust: number;
    direction: number;
    direction10m: number | null;
  };
  rain: {
    rate: number;
    daily: number;
    event: number;
    hourly: number | null;
    last24h: number | null;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  pressure: { relative: number; absolute: number | null };
  solar: { radiation: number; uvi: number };
  air: { pm25: number | null; aqi: number | null; aqi24h: number | null };
  lightning: {
    countToday: number;
    lastDistanceKm: number | null;
    lastTime: number | null; // epoch ms
  };
}

export interface SeriesPoint {
  t: number; // epoch ms
  v: number;
}

/** Today's 5-minute history since local midnight. */
export interface StationToday {
  temperature: SeriesPoint[];
  feelsLike: SeriesPoint[];
  humidity: SeriesPoint[];
  pressure: SeriesPoint[];
  solar: SeriesPoint[];
  uvi: SeriesPoint[];
  windSpeed: SeriesPoint[];
  windGust: SeriesPoint[];
  windDirection: SeriesPoint[];
  rainRate: SeriesPoint[];
}

export interface ForecastHour {
  time: string; // local ISO "2026-10-09T14:00"
  temperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
  windSpeed: number;
  windDirection: number;
  isDay: boolean;
}

export interface ForecastDay {
  date: string; // "2026-10-09"
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  windSpeedMax: number;
  windGustMax: number;
}

export interface Forecast {
  current: {
    temperature: number;
    cloudCover: number;
    weatherCode: number;
    isDay: boolean;
  };
  hourly: ForecastHour[];
  daily: ForecastDay[];
}

/** One day of the archive, as stored in MongoDB. */
export interface DailyRecord {
  id: string;
  date: string; // "YYYYMMDD"
  day: number;
  month: number;
  year: number;
  tempHigh: number;
  tempLow: number;
  tempAvg: number;
  windspeedHigh: number;
  windspeedLow: number;
  windspeedAvg: number;
  windgustHigh: number;
  windgustLow: number;
  windgustAvg: number;
  dewptHigh: number;
  dewptLow: number;
  dewptAvg: number;
  windchillHigh: number;
  windchillLow: number;
  windchillAvg: number;
  heatindexHigh: number;
  heatindexLow: number;
  heatindexAvg: number;
  pressureMax: number;
  pressureMin: number;
  pressureTrend: number;
  precipRate: number;
  precipTotal: number;
  solarRadiationHigh: number;
  uvHigh: number;
  winddirAvg: number;
  humidityHigh: number;
  humidityLow: number;
  humidityAvg: number;
  lightningCount: number;
  pm25Avg: number;
  pm25Max: number;
  pm25Min: number;
}

export interface RecordEntry {
  value: number;
  date: string; // "YYYYMMDD"
}

export interface Records {
  since: string; // first archived day "YYYYMMDD"
  days: number;
  hottest: RecordEntry;
  coldest: RecordEntry;
  warmestNight: RecordEntry;
  coolestDay: RecordEntry;
  wettest: RecordEntry;
  strongestGust: RecordEntry;
  highestUv: RecordEntry;
  mostLightning: RecordEntry;
  highestPressure: RecordEntry;
  lowestPressure: RecordEntry;
  longestDrySpell: { days: number; from: string; to: string };
  longestWetSpell: { days: number; from: string; to: string };
  years: {
    year: number;
    rain: number;
    tempAvg: number;
    tempHigh: number;
    tempLow: number;
    rainyDays: number;
    days: number;
  }[];
  /** The same calendar day in previous years. */
  onThisDay: DailyRecord[];
}
