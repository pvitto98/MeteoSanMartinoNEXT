import React from 'react';
import styles from './AirQuality.module.css';

export interface AirQualityMetricProps {
  icon: string;
  value: string| number;
  label: string;
  unit?: string;
}

export interface AirQualityProps {
  aqi: number;
  pm25: number;
}

const AirQualityMetric: React.FC<AirQualityMetricProps> = ({
  icon,
  value,
  label,
  unit
}) => {
  const isSmallFont = value === "Molto buona" || value === "Molto inquinata";
  return (
    <div className={styles.metric} role="group" aria-label={`${label} measurement`}>
      <img
        loading="lazy"
        src={icon}
        className={styles.metricIcon}
        alt=""
      />
      <div className={styles.metricContent}>
        <div className={`${styles.metricValue} ${isSmallFont ? styles.small : ''}`}>
          {value}{unit}
        </div>
        <div className={styles.metricLabel}>
          {label}
        </div>
      </div>
    </div>
  );
};

// Function to get the qualitative air quality label based on AQI value
function getAirQualityLabel(aqi: number): string {
  if (aqi <= 20) return "Ottima";
  if (aqi <= 50) return "Molto buona";
  if (aqi <= 80) return "Buona";
  if (aqi <= 100) return "Discreta";
  if (aqi <= 130) return "Accettabile";
  if (aqi <= 150) return "Mediocre";
  if (aqi <= 200) return "Scadente";
  if (aqi <= 250) return "Inquinata";
  if (aqi <= 300) return "Molto Inquinata";
  return "Pessima"; // For AQI > 300
}

export const AirQuality: React.FC<AirQualityProps> = ({ aqi, pm25 }) => {
  const metrics = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/915b8aa5e153108ce1a23cd61b29ccac183388cb0b640c6338007033c72f3da3?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: getAirQualityLabel(aqi),
      unit: "",
      label: "Qualita" // Use the qualitative label instead of "AQI"
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/eedb2cfea0957740f3ca4872a3c8cc1f5b725e1bf62111f5f724e544e891de22?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: pm25,
      unit: "",
      label: "PM2.5"
    }
  ];

  return (
    <section className={styles.airQuality} aria-labelledby="air-quality-title">
      <h2 id="air-quality-title" className={styles.title}>
        Qualità aria
      </h2>
      <div className={styles.metricsContainer}>
        {metrics.map((metric, index) => (
          <AirQualityMetric
            key={`metric-${index}`}
            icon={metric.icon}
            value={metric.value}
            unit={metric.unit}
            label={metric.label}
          />
        ))}
      </div>
    </section>
  );
};
