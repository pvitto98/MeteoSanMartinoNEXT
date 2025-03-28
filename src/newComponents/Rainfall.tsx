import React from "react";
import styles from "./Rainfall.module.css";
import RainRateSpeedometer from "./RainRateSpeedometer";
import RainBar from "./RainBar";
import SharedContainer from './SharedContainer';

export interface RainfallProps {
  rate: number;
  dailyRain: number;
  monthlyRain: number;
}

export const Rainfall: React.FC<RainfallProps> = ({ rate, dailyRain, monthlyRain }) => {
  return (
    <SharedContainer title="Pioggia" className={styles.rainfallContainer}>
      <div className={styles.metricsContainer}>
        <RainBar dailyRain={dailyRain} monthlyRain={monthlyRain} />
        <div className={styles.speedometerContainer}>
          <RainRateSpeedometer rainRate={rate} />
        </div>
      </div>
    </SharedContainer>
  );
};
