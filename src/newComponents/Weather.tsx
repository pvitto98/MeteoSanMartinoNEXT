import * as React from 'react';
import styles from './Weather.module.css';
import { useEffect, useState } from 'react';
import { getWeatherIcon } from '../utils/getWeatherIcon';

type TemperatureType = {
  temperature: number;
  perceivedTemperature: number;
  dewPoint: number;
  humidity: number;
  pressure: number;
  rainRate: number;
  lightningCount: number;
  uvSolar: number;
};

const WeatherCardContainer: React.FC = () => {
  const weatherData: TemperatureType = {
    temperature: 18,
    perceivedTemperature: 11.2,
    dewPoint: 6.9,
    humidity: 82,
    pressure: 1019.6,
    rainRate: 0.0,
    lightningCount: 0,
    uvSolar: 0, // Example value indicating night
  };

  return <WeatherCard {...weatherData} />;
};

const WeatherValue: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  const [numericValue, unit] = value.split(/([^\d.,]+)/); // Splits value into number and unit
  return (
    <div className={styles.container}>
      <div className={styles.value}>
        {numericValue}
        <span className={styles.unit}>{unit}</span>
      </div>
      <div className={styles.label}>{label}</div>

    </div>
  );
};



export const WeatherCard: React.FC<TemperatureType> = ({
  temperature,
  perceivedTemperature,
  dewPoint,
  humidity,
  pressure,
  rainRate,
  lightningCount,
  uvSolar
}) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after a short delay to ensure component is mounted
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const { icon: weatherIcon, condition } = getWeatherIcon(
    uvSolar,
    rainRate,
    pressure,
    ""
  );

  console.log(lightningCount);
  return (
    <section
      className={`${styles.temperature} ${uvSolar === 0 ? styles.nightMode : ''}`}
      aria-label="Weather information"
    >
      <div className={styles.mainContent}>
        <div className={styles.infoContainer}>
          <div className={styles.dateContainer}>
            <div className={styles.date}>{new Date().toLocaleDateString('it-IT')}</div>
            <div className={styles.condition}>{condition}</div>
          </div>
          <div className={styles.temperatureValue}>
            {temperature}
            <span className={styles.unitBig}>°C</span>
          </div>
          <div className={styles.textStart}>
            Percepita: {perceivedTemperature}
            <span className={styles.unit}>°C</span>
          </div>
        </div>
        <div
          className={`${styles.weatherIconWrapper} ${animate ? styles.zoom : ''}`}
          style={{ backgroundImage: `url(${weatherIcon})` }}
          aria-label={`Weather condition: ${condition}`}
        />
      </div>
      <div className={styles.additionalValues}>
        {[
          { label: 'Dew Point', value: `${dewPoint}°C` },
          { label: 'Umidità', value: `${humidity}%` },
          { label: 'Pressione', value: `${pressure} hPa` },
        ].map((item, index) => (
          <WeatherValue key={index} label={item.label} value={item.value} />
        ))}
      </div>
    </section>
  );
};



export default WeatherCardContainer;
