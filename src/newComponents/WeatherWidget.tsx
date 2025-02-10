import React, { useState, useEffect } from 'react';
import styles from './WeatherWidget.module.css';
import { getCardinalDirection } from "@/utils/directionUtils";

interface WeatherWidgetProps {
  data: WeatherData;
  isSpecial?: boolean; // Add isSpecial prop
}

export interface WeatherData {
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

interface WeatherValueProps {
  icon: string;
  value: number | string;
  unit?: string;
  maxValue?: number|string;
  minValue?: number|string;
  iconAlt: string;
  label: string; // Add label property
  maxLabel?: string; // Add maxLabel property
  minLabel?: string; // Add minLabel property
}

function formatDate(dateString: string): string {
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4, 6);
  const day = dateString.slice(6, 8);
  return `${day}/${month}/${year}`;
}

const WeatherValue: React.FC<WeatherValueProps> = ({
  icon,
  value,
  unit,
  maxValue,
  minValue,
  iconAlt,
  label,
  maxLabel = "max", // Default to "max" if not provided
  minLabel = "min"  // Default to "min" if not provided
}) => {
  return (
    <div className={styles.weatherValue}>
      <img
        loading="lazy"
        src={icon}
        alt={iconAlt}
        className={styles.weatherIcon}
      />
      <div className={styles.label}>{label}</div> {/* Add label display */}

      <div className={styles.valueContent}>

        <div className={styles.mainValue}>
          <span className={styles.value}>{value}</span>
          {unit && <span className={styles.unit}>{unit}</span>}
        </div>
        {(maxValue || minValue) && (
          <div className={styles.minMaxValues}>
            {maxValue && (
              <div className={styles.maxValue}>
                {/* <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/7e46bad1993f1ca829c95a86eaeccb082dba3569bf577b9c5ac0397f8d2e6d09?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794"
                  alt=""
                  className={styles.minMaxIcon}
                /> */}
                <span>{maxValue}</span>
                <span className={styles.minMaxLabel}>{maxLabel}</span> {/* Use maxLabel */}
              </div>
            )}
            {minValue && (
              <div className={styles.minValue}>
                {/* <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/ac9a20984761c75044f4a8ccf2a548950fc5da1479576d0b8c25221a9a9a4d65?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794"
                  alt=""
                  className={styles.minMaxIcon}
                /> */}
                <span>{minValue}</span>
                <span className={styles.minMaxLabel}>{minLabel}</span> {/* Use minLabel */}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ data, isSpecial }) => {
  const [showSecondRow, setShowSecondRow] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setShowSecondRow(true);
    }
  }, []);

  const weatherValues = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/436978b5d21373206bc87b78e9c8cba073d89caab428c0881e6450a0a9c4cd5d?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: data.tempAvg,
      unit: "°C",
      maxValue: data.tempLow,
      minValue: data.tempHigh,
      iconAlt: "Temperature",
      label: "Temperatura", // Add label
      maxLabel: "Min", // Add maxLabel
      minLabel: "Max"  // Add minLabel
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/72ea77f5474611c4884dcaec9b01fe05e22b7ee4a474e17f9be9459e72b5c232?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: data.windspeedAvg,
      unit: "km/h",
      iconAlt: "Wind speed",
      label: "Vento", // Add label
      maxValue: getCardinalDirection(data.winddirAvg),
      minValue: Math.round(data.windgustHigh),
      maxLabel: "Dir.", // Add maxLabel
      minLabel: "Raffica"  // Add minLabel
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/f4ad4f45d8ed908bf92639e0d2b0bd7ab61f4b258ac96e6233aeecead0b8770e?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: data.precipTotal,
      unit: "mm",
      iconAlt: "Rain amount",
      label: "Pioggia" // Add label
    }
  ];

  const secondRowValues = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/122601393d3450f65774b81614cbc36d32c9a8ce81f40359a6484fd479acb7b4?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: Math.round(data.humidityAvg),
      unit: "%",
      maxValue: Math.round(data.humidityLow),
      minValue: Math.round(data.humidityHigh),
      iconAlt: "Humidity",
      label: "Umidità", // Add label
      maxLabel: "Min", // Add maxLabel
      minLabel: "Max"  // Add minLabel
    },
    ...(data.pm25Avg !== -1 ? [{
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/26a58c8723c3b8428c9958df2d88d759413ec5a518e3844ffc6f31f92a70ee2b?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: Math.round(data.pm25Avg),
      maxValue: data.pm25Min,
      minValue: data.pm25Max,
      iconAlt: "Air quality",
      label: "Qualità dell'aria",
      maxLabel: "Min", // Add maxLabel
      minLabel: "Max"  // Add minLabel
    }] : []),
    ...(data.uvHigh !== -1 ? [{
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/8c5a0fbf90e628c7ccb81a4b45ccff61f0e5c5362add0cb6133ed8ceba20e71d?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: Math.round(data.uvHigh),
      maxValue: data.solarRadiationHigh,
      iconAlt: "UV index",
      label: "Indice UV",
      maxLabel: "Rad Sol."
    }] : []),
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/d57b4eba370a7a5fac59444757ebfac569aaf0f70b29a2075b9bf7235b1de63e?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: Math.round(data.pressureMax),
      unit: "hPa",
      maxValue: Math.round(data.pressureMin),
      minValue: Math.round(data.pressureMax),
      iconAlt: "Pressure",
      label: "Pressione",
      maxLabel: "Min", // Add maxLabel
      minLabel: "Max"  // Add minLabel
    }
  ];

  return (
    <section
      className={`${styles.dailyValue} ${isSpecial ? styles.specialWeatherWidget : ''}`}
      aria-label="Weather information"
    >
      <header className={styles.header}>
        <time className={styles.date}>
          {isSpecial ? "Riassunto" : formatDate(data.date)}
        </time>
        <button
          className={styles.expandButton}
          onClick={() => setShowSecondRow(!showSecondRow)}
          aria-expanded={showSecondRow}
          aria-label="Toggle additional weather information"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/be407cfbd790fe1d3556beeff2f4163fd062cef6867f306436f364fa5e4e906d?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794"
            alt=""
            className={styles.expandIcon}
          />
        </button>
      </header>

      <div className={styles.values}>
        <div className={styles.firstRow}>
          {weatherValues.map((item, index) => (
            <WeatherValue
              key={index}
              icon={item.icon}
              value={item.value}
              unit={item.unit}
              maxValue={item.maxValue}
              minValue={item.minValue}
              iconAlt={item.iconAlt}
              label={item.label} // Add label
              maxLabel={item.maxLabel} // Add maxLabel
              minLabel={item.minLabel} // Add minLabel
            />
          ))}
          {showSecondRow && secondRowValues.map((item, index) => (
            <WeatherValue
              key={index}
              icon={item.icon}
              value={item.value}
              unit={item.unit}
              maxValue={item.maxValue}
              minValue={item.minValue}
              iconAlt={item.iconAlt}
              label={item.label}
              maxLabel={item.maxLabel} // Add maxLabel
              minLabel={item.minLabel} // Add minLabel
            />
          ))}
        </div>
      </div>
    </section>
  );
};
