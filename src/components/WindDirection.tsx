import React from "react";
import styles from "./WindDirection.module.css";

interface WindCircleProps {
  windDirection: number; // Wind direction in degrees (0-360)
  windSpeed: number; // Wind speed
  windGust: number; // Wind speed
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

const WindDirection: React.FC<WindCircleProps> = ({ windDirection, windSpeed, windGust }) => {
  // Adjust the radians calculation by subtracting 90 degrees (PI / 2)
  const radians = ((windDirection - 90) * Math.PI) / 180;
  const arrowX = Math.cos(radians) * 50; // X-coordinate of the arrow on the circle's border
  const arrowY = Math.sin(radians) * 50; // Y-coordinate of the arrow on the circle's border
  const windCardinalDirection = getCardinalDirection(windDirection);

  return (
    <div className={styles.windCircleContainer}>

      <div className={styles.windCircle}>
        {/* Arrow element */}
        <div
          className={styles.arrow}
          style={{
            transform: `translate(${arrowX}px, ${arrowY}px) rotate(${windDirection + 180}deg)`, // Add 180 degrees to point inward
          }}
        >
          <svg width="20" height="20" viewBox="0 0 100 100">
            <polygon points="50,10 60,90 40,90" fill="#757575" />
          </svg>
        </div>
        {/* Wind direction value inside the circle */}
        <b className={styles.windDirectionValue}>
          {windCardinalDirection} ({windDirection}°)
        </b>

      </div>
      {/* <img
        loading="lazy"
        src={"https://cdn.builder.io/api/v1/image/assets/TEMP/19531b8fadc1322a1e7999c30e4e1bc35940cfc4cea03766388250f741e543b4?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794"}
        className={styles.statIcon}
        alt={`Wind direction icon`}
      /> */}
      <div className={styles.statLabel}>Direzione del Vento</div>

      {/* Wind speed below the circle */}
      {/* <div className={styles.windSpeedContainer}>
        <div>Velocità vento:</div>
        <div>{windSpeed} km/h</div>
      </div>
      <div className={styles.windSpeedContainer}>
        <div>Raffica di vento:</div>
        <div>{windGust} km/h</div>
      </div> */}
    </div>
  );
};

export default WindDirection;
