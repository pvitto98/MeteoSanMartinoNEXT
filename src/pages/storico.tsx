import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import styles from './storico.module.css';
import "../global.css";
import { WeatherWidget } from '@/newComponents/WeatherWidget';

interface WeatherData {
  id: number;
  date: string;
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

interface StoricoProps {
  years: string[];
  months: string[];
}

const calculateMonthlyAverages = (data: WeatherData[]): WeatherData => {
  const totalEntries = data.length;
  const sum = data.reduce((acc, curr) => {
    acc.tempHigh = Math.max(acc.tempHigh, curr.tempHigh);
    acc.tempLow = Math.min(acc.tempLow, curr.tempLow);
    acc.tempAvg += curr.tempAvg;
    acc.windspeedHigh = Math.max(acc.windspeedHigh, curr.windspeedHigh);
    acc.windspeedLow = Math.min(acc.windspeedLow, curr.windspeedLow);
    acc.windspeedAvg += curr.windspeedAvg;
    acc.windgustHigh = Math.max(acc.windgustHigh, curr.windgustHigh);
    acc.windgustLow = Math.min(acc.windgustLow, curr.windgustLow);
    acc.windgustAvg += curr.windgustAvg;
    acc.dewptHigh = Math.max(acc.dewptHigh, curr.dewptHigh);
    acc.dewptLow = Math.min(acc.dewptLow, curr.dewptLow);
    acc.dewptAvg += curr.dewptAvg;
    acc.windchillHigh = Math.max(acc.windchillHigh, curr.windchillHigh);
    acc.windchillLow = Math.min(acc.windchillLow, curr.windchillLow);
    acc.windchillAvg += curr.windchillAvg;
    acc.heatindexHigh = Math.max(acc.heatindexHigh, curr.heatindexHigh);
    acc.heatindexLow = Math.min(acc.heatindexLow, curr.heatindexLow);
    acc.heatindexAvg += curr.heatindexAvg;
    acc.pressureMax = Math.max(acc.pressureMax, curr.pressureMax);
    acc.pressureMin = Math.min(acc.pressureMin, curr.pressureMin);
    acc.pressureTrend += curr.pressureTrend;
    acc.precipRate = Math.max(acc.precipRate, curr.precipRate);
    acc.precipTotal += curr.precipTotal; // Sum of all the rain
    acc.solarRadiationHigh = Math.max(acc.solarRadiationHigh, curr.solarRadiationHigh);
    acc.uvHigh = Math.max(acc.uvHigh, curr.uvHigh);
    acc.winddirAvg += curr.winddirAvg;
    acc.humidityHigh = Math.max(acc.humidityHigh, curr.humidityHigh);
    acc.humidityLow = Math.min(acc.humidityLow, curr.humidityLow);
    acc.humidityAvg += curr.humidityAvg;
    acc.lightningCount += curr.lightningCount;
    acc.pm25Avg += curr.pm25Avg;
    acc.pm25Max = Math.max(acc.pm25Max, curr.pm25Max);
    acc.pm25Min = Math.min(acc.pm25Min, curr.pm25Min);
    return acc;
  }, {
    id: 0,
    date: '',
    day: 0,
    month: 0,
    year: 0,
    tempHigh: -Infinity,
    tempLow: Infinity,
    tempAvg: 0,
    windspeedHigh: -Infinity,
    windspeedLow: Infinity,
    windspeedAvg: 0,
    windgustHigh: -Infinity,
    windgustLow: Infinity,
    windgustAvg: 0,
    dewptHigh: -Infinity,
    dewptLow: Infinity,
    dewptAvg: 0,
    windchillHigh: -Infinity,
    windchillLow: Infinity,
    windchillAvg: 0,
    heatindexHigh: -Infinity,
    heatindexLow: Infinity,
    heatindexAvg: 0,
    pressureMax: -Infinity,
    pressureMin: Infinity,
    pressureTrend: 0,
    precipRate: -Infinity,
    precipTotal: 0,
    solarRadiationHigh: -Infinity,
    uvHigh: -Infinity,
    winddirAvg: 0,
    humidityHigh: -Infinity,
    humidityLow: Infinity,
    humidityAvg: 0,
    lightningCount: 0,
    pm25Avg: 0,
    pm25Max: -Infinity,
    pm25Min: Infinity,
  });

  return {
    ...sum,
    date: "Media mensile",
    tempAvg: Math.round((sum.tempAvg / totalEntries) * 10) / 10,
    windspeedAvg: Math.round((sum.windspeedAvg / totalEntries) * 10) / 10,
    windgustAvg: Math.round((sum.windgustAvg / totalEntries) * 10) / 10,
    dewptAvg: Math.round((sum.dewptAvg / totalEntries) * 10) / 10,
    windchillAvg: Math.round((sum.windchillAvg / totalEntries) * 10) / 10,
    heatindexAvg: Math.round((sum.heatindexAvg / totalEntries) * 10) / 10,
    pressureTrend: Math.round((sum.pressureTrend / totalEntries) * 10) / 10,
    precipTotal: Math.round(sum.precipTotal * 10) / 10, // Sum of all the rain
    winddirAvg: Math.round((sum.winddirAvg / totalEntries) * 10) / 10,
    humidityAvg: Math.round((sum.humidityAvg / totalEntries) * 10) / 10,
    pm25Avg: Math.round((sum.pm25Avg / totalEntries) * 10) / 10,
  };
};

const StoricoPage = ({ years, months }: StoricoProps) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [loading, setLoading] = useState(false);
  const [averageData, setAverageData] = useState<WeatherData | null>(null);

  const fetchWeatherData = async (year: string, month?: string) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ year });
      if (month) query.append('month', month);

      const res = await fetch(`/api/weather?${query.toString()}`);
      if (res.ok) {
        const { weatherData } = await res.json();
        setWeatherData(weatherData);
        console.log(weatherData);
      } else {
        console.error('Failed to fetch weather data');
        setWeatherData([]);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (weatherData.length > 0) {
      setAverageData(calculateMonthlyAverages(weatherData));
    } else {
      setAverageData(null);
    }
  }, [weatherData]);

  return (
    <div className={styles.tableContainer}>
      <h1 className={styles.header}>Riepilogo mensile</h1>

      <div className={styles.selectorsContainer}>
        <select
          className={styles.selector}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Seleziona anno</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          className={styles.selector}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">Seleziona mese (opzionale)</option>
          {months.map((month) => (
            <option
              key={month}
              value={month}
              disabled={selectedYear === currentYear && Number(month) > Number(currentMonth)}
            >
              {month}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className={styles.loadingMessage}>Caricamento dati...</p>
      ) : (
        <>
          {averageData && (
            <div className={styles.widgetWrapper}>
              <WeatherWidget data={averageData} isSpecial />
            </div>
          )}
          {weatherData.length > 0 ? (
            <div className={styles.widgetsContainer}>
              {weatherData.map((data) => (
                <div key={data.id} className={styles.widgetWrapper}>
                  <WeatherWidget data={data} />
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noDataMessage}>Nessun dato disponibile per i filtri selezionati.</p>
          )}
        </>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/metadata`);
  if (!res.ok) {
    return { props: { years: [], months: [] } };
  }

  const { years, months } = await res.json();
  return {
    props: { years, months },
  };
};

export default StoricoPage;
