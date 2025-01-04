import { FunctionComponent } from "react";
import styles from "./Temperature.module.css";

export type TemparetureType = {
  className?: string;
  temperature: number;
  perceivedTemperature: number;
  dewPoint: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  day: string;
  time: string;
  rainRate: number; // Nuova proprietà
  lightningCount: number; // Nuova proprietà
};

// Funzione per convertire i gradi in direzione cardinale
const getCardinalDirection = (degrees: number) => {
  if (degrees >= 337.5 || degrees < 22.5) return "N";
  if (degrees >= 22.5 && degrees < 67.5) return "NE";
  if (degrees >= 67.5 && degrees < 112.5) return "E";
  if (degrees >= 112.5 && degrees < 157.5) return "SE";
  if (degrees >= 157.5 && degrees < 202.5) return "S";
  if (degrees >= 202.5 && degrees < 247.5) return "SO";
  if (degrees >= 247.5 && degrees < 292.5) return "O";
  if (degrees >= 292.5 && degrees < 337.5) return "NO";
  return ""; // Caso di fallback
};

// Funzione per determinare l'icona del tempo in base alla pressione atmosferica, rainRate e lightningCount
const getWeatherIcon = (
  pressure: number,
  rainRate: number,
  lightningCount: number,
  temperature: number
) => {
  console.log(pressure);
  if (pressure >= 1015) {
    return "/sunny-icon.png"; // Alta pressione -> Sole
  } else if (pressure >= 1012) {
    return "/partly-cloudy-icon.png"; // Pressione 1012 -> Poco nuvoloso
  } else if (pressure >= 1010) {
    return "/cloudy-icon.png"; // Pressione 1010 -> Nuvoloso
  } else if (pressure >= 1008 && rainRate > 0.1) {
    return "/rain-icon.png"; // Pioggia
  } else if (pressure >= 1008 && lightningCount >= 1) {
    return "/storm-icon.png"; // Temporale
  } else if (pressure < 1008 && temperature <= 2.5) {
    return "/snow-icon.png"; // Neve
  } else if (pressure < 1008) {
    return "/rain-icon.png"; // Pioggia (anche al di sotto di 1008 hPa)
  }
  return "/rain-icon.png"; // Caso di fallback
};

// Funzione per determinare il colore in base alla temperatura
const getTemperatureColor = (temperature: number) => {
  if (temperature <= 0) return "#0000FF"; // Blu per temperature sotto 0°C
  if (temperature <= 5) return "#1E90FF"; // Azzurro fino a 5°C
  if (temperature <= 10) return "#00BFFF"; // Celeste fino a 10°C
  if (temperature <= 15) return "#87CEFA"; // Azzurro chiaro fino a 15°C
  if (temperature <= 20) return "#FFFF00"; // Giallo fino a 20°C
  if (temperature <= 25) return "#FFD700"; // Oro fino a 25°C
  if (temperature <= 30) return "#FFA500"; // Arancione fino a 30°C
  return "#FF4500"; // Rosso per temperature sopra i 30°C
};


const Tempareture: FunctionComponent<TemparetureType> = ({
  className = "",
  temperature,
  perceivedTemperature,
  dewPoint,
  humidity,
  windSpeed,
  windDirection,
  pressure,
  day,
  time,
  rainRate, // Nuova proprietà
  lightningCount, // Nuova proprietà
}) => {
  // const windCardinalDirection = getCardinalDirection(windDirection);
  const weatherIcon = getWeatherIcon(
    pressure,
    rainRate,
    lightningCount,
    temperature
  );
  
  const temperatureColor = getTemperatureColor(temperature); // Determina il colore della temperatura



  return (
    <div className={[styles.tempareture, className].join(" ")}>
      <div className={styles.datetime}>
        <div className={styles.datetimeChild} />
        <b className={styles.am}>{time}</b>
      </div>
      <div className={styles.iconTemp}>
        <div className={styles.iconTemperature}>
          <img
            className={styles.sunnnyWindyIcon1}
            loading="lazy"
            alt="Weather icon"
            src={weatherIcon}
          />
          <b
            className={styles.c}
            style={{ color: temperatureColor }} // Applica il colore della temperatura
          >
            {temperature}
            <sup>0</sup>C
          </b>

          <div className={styles.perceptionDetails}>
            <div className={styles.percepitaParent}>
              <div className={styles.percepita}>Percepita</div>
              <b className={styles.c1}>
                {perceivedTemperature}
                <sup>0</sup>C
              </b>
            </div>
            <div className={styles.dewPointParent}>
              <div className={styles.dewPoint}>Dew Point</div>
              <b className={styles.c1}>
                {dewPoint}
                <sup>0</sup>C
              </b>
            </div>
            <div className={styles.humidityParent}>
              <div className={styles.humidity}>Humidity</div>
              <b className={styles.b}>{humidity}%</b>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.empty}>
        <div className={styles.empty1} />
      </div>
      {/* <div className={styles.windDetails}>
        <div className={styles.windSpeedWrapper}>
          <div className={styles.windSpeedLabel}>Velocità del Vento</div>
          <b className={styles.windSpeedValue}>{windSpeed} km/h</b>
        </div>
        <div className={styles.windDirectionWrapper}>
          <div className={styles.windDirectionLabel}>Direzione del Vento</div>
          <img
            className={styles.windArrow}
            src="/arrow-icon.png"
            alt="Wind Direction Arrow"
            style={{ transform: `rotate(${windDirection}deg)` }}
          />
          <b className={styles.windDirectionValue}>
            {windCardinalDirection} ({windDirection}°)
          </b>
        </div>

      </div> */}
              {/* Pressione atmosferica sotto la direzione del vento */}

      <div className={styles.pressureWrapper}>
          <div className={styles.pressureLabel}>Pressione Atmosferica</div>
          <b className={styles.pressureValue}>{pressure} hPa</b>
        </div>
    </div>
  );
};

export default Tempareture;


