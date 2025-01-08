import React from 'react';
import styles from './AirQuality.module.css';

export interface AirQualityMetricProps {
  icon: string;
  value: number;
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
  return (
    <div className={styles.metric} role="group" aria-label={`${label} measurement`}>
      <img
        loading="lazy"
        src={icon}
        className={styles.metricIcon}
        alt=""
      />
      <div className={styles.metricContent}>
        <div className={styles.metricValue}>
          {value}{unit}
        </div>
        <div className={styles.metricLabel}>
          {label}
        </div>
      </div>
    </div>
  );
};

export const AirQuality: React.FC<AirQualityProps> = ({ aqi, pm25 }) => {
  const metrics = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/915b8aa5e153108ce1a23cd61b29ccac183388cb0b640c6338007033c72f3da3?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: aqi,
      unit: "",
      label: "AQI"
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
        Qualita aria
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
