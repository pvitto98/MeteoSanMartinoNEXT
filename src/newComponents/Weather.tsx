import * as React from 'react';
import styles from './Weather.module.css';
import { useEffect, useState } from 'react';

const getWeatherIcon = (
  uvSolar: number, // Replace isNight with uvSolar
  rainRate: number,
  pressure: number, // Use pressure instead of cloudCoverage
  lastLightningTime: string | null
): { icon: string; condition: string } => {
  const currentTime = new Date();
  const lightningThresholdMinutes = 30;

  const latitude = 0; // Replace with actual latitude value
  const longitude = 0; // Replace with actual longitude value

  // Mock function to check full moon (always returns false for now)
  const isFullMoon = (): boolean => {
    return false; // Mocked: Not a full moon
  };

  const isNight = uvSolar === 0;

  const fullMoon = isNight && isFullMoon(); // Use mocked full moon logic

  // Check if there's a recent lightning event within the last 30 minutes
  if (lastLightningTime) {
    const lastLightningDate = new Date(lastLightningTime);
    const timeDifference = (currentTime.getTime() - lastLightningDate.getTime()) / 60000; // Convert ms to minutes
    if (timeDifference <= lightningThresholdMinutes) {
      if (rainRate > 0) {
        return {
          icon: "/day-heavy-thunder-rain-icon.png",
          condition: "Temporale",
        };
      }
      return {
        icon: "/thunder.png",
        condition: "Fulmini",
      };
    }
  }

  // Handle rain icons
  if (rainRate > 0) {
    return {
      icon: isNight ? "/WeatherIcons/night-rain-icon.png" : "/WeatherIcons/day-rain-icon.png",
      condition: "Pioggia",
    };
  }

  // Handle cloudy icons based on pressure
  if (pressure <= 1010 ) { // Lower pressure indicates clouds or stormy conditions
    return {
      icon: "/WeatherIcons/cloudy-icon.png",
      condition: "Coperto",
    };
  }
    else if (pressure > 1010 && pressure <= 1012 ) { // Lower pressure indicates clouds or stormy conditions
      return {
      icon: isNight ? "/WeatherIcons/night-almost-cloudy-icon.png" : "/WeatherIcons/day-almost-cloudy-icon.png",
      condition: "Nuvoloso",
    };
  } else if (pressure > 1012 && pressure < 1015 ) { // Lower pressure indicates clouds or stormy conditions
      return {
      icon: isNight ? "/WeatherIcons/night-partially-cloudy-icon.png" : "/WeatherIcons/day-partially-cloudy-icon.png",
      condition: "Poco Nuvoloso",
    };
  }

  // Handle clear icons for higher pressure
  if (pressure >= 1015) { // Higher pressure indicates clearer conditions
    if (fullMoon) {
      return {
        icon: "/WeatherIcons/night-full-moon-icon.png",
        condition: "Sereno",
      };
    }
    return {
      icon: isNight ? "/WeatherIcons/night-clear-icon.png" : "/WeatherIcons/day-clear-icon.png",
      condition: "Sereno",
    };
  }

  // Default clear if no condition matched
  return {
    icon: isNight ? "/WeatherIcons/night-clear-icon.png" : "/WeatherIcons/day-clear-icon.png",
    condition: "Sereno",
  };
};

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
  uvSolar,
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
          { label: 'Humidity', value: `${humidity}%` },
          { label: 'Pressure', value: `${pressure} hPa` },
        ].map((item, index) => (
          <WeatherValue key={index} label={item.label} value={item.value} />
        ))}
      </div>
    </section>
  );
};



export default WeatherCardContainer;
