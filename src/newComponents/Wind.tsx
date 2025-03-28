import React from 'react';
import styles from './Wind.module.css';
import WindDirection from '@/newComponents/WindDirection';
import SharedContainer from './SharedContainer';

export interface WeatherStatProps {
  icon: string;
  value: string;
  label: string;
  unit?: string;
}

export interface WeatherStatsProps {
  windSpeed: number;
  windDirection: number;
  windGust: number;  // Changed from humidity to windGust
}

const getCardinalDirection = (degrees: number) => {
  if (degrees >= 337.5 || degrees < 22.5) return "N";
  if (degrees >= 22.5 && degrees < 67.5) return "NE";
  if (degrees >= 67.5 && degrees < 112.5) return "E";
  if (degrees >= 112.5 && degrees < 157.5) return "SE";
  if (degrees >= 157.5 && degrees < 202.5) return "S";
  if (degrees >= 202.5 && degrees < 247.5) return "SO";
  if (degrees >= 247.5 && degrees < 292.5) return "O";
  if (degrees >= 292.5 && degrees < 337.5) return "NO";
  return "";
};

const WeatherStat: React.FC<WeatherStatProps> = ({ icon, value, label, unit }) => {
  return (
    <div className={styles.statContainer}>
      <img
        loading="lazy"
        src={icon}
        className={styles.statIcon}
        alt={`${label} icon`}
      />
              <div className={styles.statLabel}>
          {label}
        </div>
      <div className={styles.statContent}>
        <div className={styles.statValue}>
          {value}
          <span className={styles.statUnit}>{unit}</span>
        </div>

      </div>
    </div>
  );
};

export const WeatherStats: React.FC<WeatherStatsProps> = ({ windSpeed, windDirection, windGust }) => {
  const weatherStats = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/0c19039dde951fe819ad3632a38a58435aff18e3a049b9badf49e4b6daff4aa5?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: `${windSpeed}`,
      label: "Vento",
      unit: "Km/h"
    },
    {
      icon: "./Raffica.svg",
      value: `${windGust}`,
      label: "Raffica",
      unit: "Km/h"
    }
  ];

  return (
    <SharedContainer title="Vento" className={styles.weatherContainer}>
      <div className={styles.windContainer}>
        <WindDirection
          windSpeed={windSpeed}
          windDirection={windDirection}
          windGust={windGust}
        />
        <div className={styles.windValues} role="list">
          {weatherStats.map((stat, index) => (
            <WeatherStat
              key={`weather-stat-${index}`}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              unit={stat.unit}
            />
          ))}
        </div>
      </div>
    </SharedContainer>
  );
};
