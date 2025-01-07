import { GetServerSideProps } from 'next';
import { useState } from 'react';
import styles from './storico.module.css'; // Import the CSS module
import "../global.css";

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
  // Find the most recent date in weatherData
  const lastDate = weatherData.reduce((latest, data) => {
    const currentDataDate = new Date(data.year, data.month - 1, data.day);
    return currentDataDate > latest ? currentDataDate : latest;
  }, new Date(0)); // Initialize with a very old date

  const lastYear = lastDate.getFullYear().toString();
  const lastMonth = (lastDate.getMonth() + 1).toString().padStart(2, '0');
  // Set initial state with current year and month
  const [selectedYear, setSelectedYear] = useState<string | undefined>(lastYear);
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(lastMonth);

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

      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <th rowSpan={2} className={styles.th}>Date</th> {/* Date column fixed */}
            <th colSpan={3} className={styles.th}>Temperature (°C)</th>
            <th colSpan={2} className={styles.th}>Pressure (hPa)</th>
            <th colSpan={2} className={styles.th}>Humidity (%)</th>
            <th colSpan={3} className={styles.th}>Wind (km/h)</th>
            <th colSpan={2} className={styles.th}>UV & Solar Radiation</th>
            <th colSpan={3} className={styles.th}>PM2.5</th>
            <th rowSpan={2} className={styles.th}>Pioggia</th> {/* Pioggia column fixed */}
            {/* <th rowSpan={2} className={styles.th}>AQI</th> AQI column fixed */}
          </tr>
          <tr className={styles.tr}>
            {/* Temperature */}
            <th className={styles.th}>T. Max</th>
            <th className={styles.th}>T. Min</th>
            <th className={styles.th}>Media</th>

            {/* Pressure */}
            <th className={styles.th}>Press. Max</th>
            <th className={styles.th}>Press. Min</th>

            {/* Humidity */}
            <th className={styles.th}>UR Max</th>
            <th className={styles.th}>UR Min</th>

            {/* Wind */}
            <th className={styles.th}>Raffica Max</th>
            <th className={styles.th}>Vento Medio</th>
            <th className={styles.th}>Dir Vento (°)</th>

            {/* UV & Solar Radiation */}
            <th className={styles.th}>UV Max</th>
            <th className={styles.th}>W/m²</th>

            {/* PM2.5 */}
            <th className={styles.th}>Min</th>
            <th className={styles.th}>Max</th>
            <th className={styles.th}>Medio</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((data) => (
              <tr key={data.id} className={styles.tr}>
                {/* Date */}
                <td className={styles.td}>
                  {`${data.year}-${data.month.toString().padStart(2, '0')}-${data.day.toString().padStart(2, '0')}`}
                </td>

                {/* Temperature */}
                <td className={styles.td}>{data.tempHigh}</td>
                <td className={styles.td}>{data.tempLow}</td>
                <td className={styles.td}>{data.tempAvg}</td>

                {/* Pressure */}
                <td className={styles.td}>{data.pressureMax}</td>
                <td className={styles.td}>{data.pressureMin}</td>

                {/* Humidity */}
                <td className={styles.td}>{data.humidityHigh}</td>
                <td className={styles.td}>{data.humidityLow}</td>

                {/* Wind */}
                <td className={styles.td}>{data.windgustHigh}</td>
                <td className={styles.td}>{data.windspeedAvg}</td>
                <td className={styles.td}>{data.winddirAvg}</td>

                {/* UV & Solar Radiation */}
                <td className={styles.td}>{data.uvHigh}</td>
                <td className={styles.td}>{data.solarRadiationHigh}</td>

                {/* PM2.5 */}
                <td className={styles.td}>{data.pm25Min}</td>
                <td className={styles.td}>{data.pm25Max}</td>
                <td className={styles.td}>{data.pm25Avg}</td>

                {/* Pioggia */}
                <td className={styles.td}>{data.precipTotal}</td>

                {/* AQI */}
                {/* <td className={styles.td}>{data.aqi}</td> */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={18} className={styles.noDataMessage}>
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
