import { GetServerSideProps } from 'next';
import { useState } from 'react';
import styles from './storico.module.css'; // Import the CSS module

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
  weatherData: WeatherData[];
  years: string[];
  months: string[];
}

const StoricoPage = ({ weatherData, years, months }: StoricoProps) => {
  const [selectedYear, setSelectedYear] = useState<string | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>();
  const [showAll, setShowAll] = useState(false); // State for showing all data

  // Limit the initial display to 100 rows
  const displayedData = showAll ? weatherData : weatherData.slice(0, 100);

  // Filter weather data using year and month properties
  const filteredData = displayedData.filter((data) => {
    const matchesYear = selectedYear ? data.year.toString() === selectedYear : true;
    const matchesMonth = selectedMonth ? data.month.toString().padStart(2, '0') === selectedMonth : true;
    return matchesYear && matchesMonth;
  });

  return (
    <div className={styles.tableContainer}>
      <h1>Weather Data History</h1>

      {/* Year and Month selectors */}
      <div className={styles.selectors}>
        <select
          className={styles.selector}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year</option>
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
          <option value="">Select Month (Optional)</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Temp High</th>
            <th className={styles.th}>Temp Low</th>
            <th className={styles.th}>Temp Avg</th>
            <th className={styles.th}>Wind Speed High</th>
            <th className={styles.th}>Wind Speed Low</th>
            <th className={styles.th}>Wind Speed Avg</th>
            <th className={styles.th}>Wind Gust High</th>
            <th className={styles.th}>Wind Gust Low</th>
            <th className={styles.th}>Wind Gust Avg</th>
            <th className={styles.th}>Dewpoint High</th>
            <th className={styles.th}>Dewpoint Low</th>
            <th className={styles.th}>Dewpoint Avg</th>
            <th className={styles.th}>Windchill High</th>
            <th className={styles.th}>Windchill Low</th>
            <th className={styles.th}>Windchill Avg</th>
            <th className={styles.th}>Heatindex High</th>
            <th className={styles.th}>Heatindex Low</th>
            <th className={styles.th}>Heatindex Avg</th>
            <th className={styles.th}>Pressure Max</th>
            <th className={styles.th}>Pressure Min</th>
            <th className={styles.th}>Pressure Trend</th>
            <th className={styles.th}>Precip Rate</th>
            <th className={styles.th}>Precip Total</th>
            <th className={styles.th}>Solar Radiation High</th>
            <th className={styles.th}>UV High</th>
            <th className={styles.th}>Wind Direction Avg</th>
            <th className={styles.th}>Humidity High</th>
            <th className={styles.th}>Humidity Low</th>
            <th className={styles.th}>Humidity Avg</th>
            <th className={styles.th}>Lightning Count</th>
            <th className={styles.th}>PM2.5 Avg</th>
            <th className={styles.th}>PM2.5 Max</th>
            <th className={styles.th}>PM2.5 Min</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((data) => (
              <tr key={data.id} className={styles.tr}>
                <td className={styles.td}>
                  {`${data.year}-${data.month.toString().padStart(2, '0')}-${data.day.toString().padStart(2, '0')}`}
                </td>
                <td className={styles.td}>{data.tempHigh}</td>
                <td className={styles.td}>{data.tempLow}</td>
                <td className={styles.td}>{data.tempAvg}</td>
                <td className={styles.td}>{data.windspeedHigh}</td>
                <td className={styles.td}>{data.windspeedLow}</td>
                <td className={styles.td}>{data.windspeedAvg}</td>
                <td className={styles.td}>{data.windgustHigh}</td>
                <td className={styles.td}>{data.windgustLow}</td>
                <td className={styles.td}>{data.windgustAvg}</td>
                <td className={styles.td}>{data.dewptHigh}</td>
                <td className={styles.td}>{data.dewptLow}</td>
                <td className={styles.td}>{data.dewptAvg}</td>
                <td className={styles.td}>{data.windchillHigh}</td>
                <td className={styles.td}>{data.windchillLow}</td>
                <td className={styles.td}>{data.windchillAvg}</td>
                <td className={styles.td}>{data.heatindexHigh}</td>
                <td className={styles.td}>{data.heatindexLow}</td>
                <td className={styles.td}>{data.heatindexAvg}</td>
                <td className={styles.td}>{data.pressureMax}</td>
                <td className={styles.td}>{data.pressureMin}</td>
                <td className={styles.td}>{data.pressureTrend}</td>
                <td className={styles.td}>{data.precipRate}</td>
                <td className={styles.td}>{data.precipTotal}</td>
                <td className={styles.td}>{data.solarRadiationHigh}</td>
                <td className={styles.td}>{data.uvHigh}</td>
                <td className={styles.td}>{data.winddirAvg}</td>
                <td className={styles.td}>{data.humidityHigh}</td>
                <td className={styles.td}>{data.humidityLow}</td>
                <td className={styles.td}>{data.humidityAvg}</td>
                <td className={styles.td}>{data.lightningCount}</td>
                <td className={styles.td}>{data.pm25Avg}</td>
                <td className={styles.td}>{data.pm25Max}</td>
                <td className={styles.td}>{data.pm25Min}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={33} className={styles.noDataMessage}>
                No data available for the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Show More Button */}
      {!showAll && weatherData.length > 100 && (
        <button onClick={() => setShowAll(true)} className={styles.toggleButton}>
          Show More
        </button>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/weather`);
  if (!res.ok) {
    return { props: { weatherData: [], years: [], months: [] } };
  }

  const { weatherData, years, months } = await res.json();
  return {
    props: {
      weatherData,
      years,
      months,
    },
  };
};

export default StoricoPage;
