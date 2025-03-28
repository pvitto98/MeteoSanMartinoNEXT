import React from 'react';
import styles from './UV.module.css';
import SolarRadiationChart from './SolarRadiationChart';
import UVPyramid from './UVPyramid';
import SharedContainer from './SharedContainer';

export interface UVStatItemProps {
  icon: string;
  value: string;
  label: string;
}

interface DateValue {
  date: string;  // Human-readable date
  value: string; // The corresponding value (could be a number or string)
}

export interface UVStatsProps {
  uvIndex: number;
  uvSolar: number;
  solarData: SolarRadiationChartProps;
}

interface SolarRadiationChartProps {
  data: { date: string, value: string }[]; // Transformed data with date and value
}


const determineUVRisk = (uvIndex: number): string => {
  if (uvIndex <= 2) return "Basso";
  if (uvIndex <= 5) return "Moderato";
  if (uvIndex <= 7) return "Alto";
  if (uvIndex <= 10) return "Molto Alto";
  return "Estremo";
};

const UVStatItem: React.FC<UVStatItemProps> = ({ icon, value, label }) => {
  return (
    <div className={styles.statItem} role="listitem">
      <img
        loading="lazy"
        src={icon}
        className={styles.statIcon}
        alt=""
      />
      <div className={styles.statLabel}>{label}</div>

      <div className={styles.statContent}>
        <div className={styles.statValue}>
          {label === "Rad. Solare" ? (
            <>
              {value.split(" ")[0]}
              <span className={styles.statUnit}> W/m²</span>
            </>
          ) : (
            value
          )}
        </div>

      </div>
    </div>
  );
};

export const UVStats: React.FC<UVStatsProps> = ({ uvIndex, uvSolar, solarData }) => {
  const uvRisk = determineUVRisk(uvIndex);

  return (
    <SharedContainer title="Sole" className={styles.uvContainer}>
      <div className={styles.uvContent} role="list">
        <SolarRadiationChart data={solarData.data} />
        <UVPyramid uvIndex={uvIndex} uvRisk={uvRisk} uvSolar={uvSolar} />
      </div>
    </SharedContainer>
  );
};
