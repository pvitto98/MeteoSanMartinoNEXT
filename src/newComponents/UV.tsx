import React from 'react';
import styles from './UV.module.css';
import SolarRadiationChart from './SolarRadiationChart';
import UVPyramid from './UVPyramid';

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

  const uvStats = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/d56085f4574e02ff755f1f65936da78d0b94aa35425d42d3120d8d62fb122c7b?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
      value: `${uvIndex}`,
      label: "Indice UV"
    },
    // {
    //   icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/1f6aea8d94fa2dd1777145da3333675b07b34ea1e1d8605a393d572ad986f280?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
    //   value: uvRisk,
    //   label: "Rischio UV"
    // },
    // {
    //   icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/9b9491783d1baa3e335b23d0192e4d069d0c28526fb0147a8963866f92bd2e4f?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794",
    //   value: `${uvSolar} W/m²`,
    //   label: "Rad. Solare"
    // }
  ];

  return (
    <section className={styles.uvContainer} aria-labelledby="uv-title">
      <h2 id="uv-title" className={styles.uvTitle}>Sole</h2>
      <div className={styles.uvContent} role="list">
      <SolarRadiationChart data={solarData.data} />


        <UVPyramid uvIndex={uvIndex
        } uvRisk={uvRisk} uvSolar={uvSolar} />

      </div>
    </section>
  );
};
