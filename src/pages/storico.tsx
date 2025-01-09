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

const StoricoPage = ({ years, months }: StoricoProps) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [loading, setLoading] = useState(false);

  const fetchWeatherData = async (year: string, month?: string) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ year });
      if (month) query.append('month', month);

      const res = await fetch(`/api/weather?${query.toString()}`);
      if (res.ok) {
        const { weatherData } = await res.json();
        setWeatherData(weatherData);
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
      ) : weatherData.length > 0 ? (
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
