import React from "react";
import styles from "./Rainfall.module.css";
import RainRateSpeedometer from "./RainRateSpeedometer";
import RainBar from "./RainBar";

export interface RainfallProps {
  rate: number;
  dailyRain: number;
  monthlyRain: number;
}

export const Rainfall: React.FC<RainfallProps> = ({ rate, dailyRain, monthlyRain }) => {
  return (
    <section className={styles.rainfallContainer} aria-labelledby="rainfall-title">
      <h2 id="rainfall-title" className={styles.rainfallTitle}>Pioggia</h2>
      <div className={styles.metricsContainer}>
      <RainBar dailyRain={dailyRain} monthlyRain={monthlyRain} />

        {/* Rain rate with speedometer */}
        <div className={styles.speedometerContainer}>
          <RainRateSpeedometer rainRate={rate} />
        </div>

      </div>
    </section>
  );
};
