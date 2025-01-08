import React from 'react';
import styles from './Rainfall.module.css';

export interface RainfallMetricProps {
  icon: string;
  value: number;
  label: string;
  alt: string;
}

export interface RainfallProps {
  rate: number;
  dailyRain: number;
  monthlyRain: number;
}

const RainfallMetric: React.FC<RainfallMetricProps> = ({
  icon,
  value,
  label,
  alt
}) => {
  // Get the current date and month
  const currentDate = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit' }).format(new Date());
  const currentMonth = new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(new Date());

  // Determine the description text under each icon
  let description;
  if (label === "Rate") {
    description = "Ora";
  } else if (label === "Oggi") {
    description = currentDate;
  } else if (label === "Mese") {
    description = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1); // Capitalize month
  }

  return (
    <div className={styles.metricContainer}>
      <img
        loading="lazy"
        src={icon}
        className={styles.metricIcon}
        alt={alt}
      />
              <div className={styles.metricDescription}>{description}</div>

      <div className={styles.metricContent}>
        <div className={styles.metricValue}>
          {value}
          {label === "Rate" ? (
            <span className={styles.metricUnit}>mm/h</span>
          ) : (
            <span className={styles.metricUnit}>mm</span>
          )}
        </div>
        <div className={styles.metricLabel}>{label}</div>
        {/* Description under the icon */}
      </div>
    </div>
  );
};

export const Rainfall: React.FC<RainfallProps> = ({ rate, dailyRain, monthlyRain }) => {
  const metrics = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/cfcf8ba615e4a50b518d4bd7ac0615d3bd5080f738afdb55c7104b7cafca46b6?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: rate,
      label: "Rate",
      alt: "Rain rate icon"
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/cfcf8ba615e4a50b518d4bd7ac0615d3bd5080f738afdb55c7104b7cafca46b6?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: dailyRain,
      label: "Oggi",
      alt: "Today's rainfall icon"
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/cfcf8ba615e4a50b518d4bd7ac0615d3bd5080f738afdb55c7104b7cafca46b6?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: monthlyRain,
      label: "Mese",
      alt: "Monthly rainfall icon"
    }
  ];

  return (
    <section className={styles.rainfallContainer} aria-labelledby="rainfall-title">
      <h2 id="rainfall-title" className={styles.rainfallTitle}>Pioggia</h2>
      <div className={styles.metricsContainer}>
        {metrics.map((metric, index) => (
          <RainfallMetric
            key={`rainfall-metric-${index}`}
            icon={metric.icon}
            value={metric.value}
            label={metric.label}
            alt={metric.alt}
          />
        ))}
      </div>
    </section>
  );
};
