import React from 'react';
import styles from './UVPyramid.module.css';

type UVPyramidProps = {
  uvIndex: number;
  uvRisk: string;
  uvSolar: number;
};

const UVPyramid: React.FC<UVPyramidProps> = ({ uvIndex, uvRisk, uvSolar}) => {
  return (
    <div className={styles.uvPyramidContainer}>
      <div className={styles.uvTitle}>
        <b>UV Index</b>
      </div>

      {/* Piramide UV */}
      <div className={styles.pyramid}>
        <div className={styles.level} style={{ backgroundColor: uvIndex >= 11 ? '#d90011' : '' }}></div>
        <div className={styles.level} style={{ backgroundColor: uvIndex >= 10 ? '#e53312' : '' }}></div>
        <div className={styles.level} style={{ backgroundColor: uvIndex >= 9 ? '#f26722' : '' }}></div>
        <div className={styles.level} style={{ backgroundColor: uvIndex >= 8 ? '#f89c32' : '' }}></div>
        <div className={styles.level} style={{ backgroundColor: uvIndex >= 7 ? '#fdcd45' : '' }}></div>
        <div className={styles.level} style={{ backgroundColor: uvIndex >= 6 ? '#ffef5d' : '' }}></div>
        <div className={styles.level} style={{ backgroundColor: uvIndex >= 5 ? '#c3e959' : '' }}></div>
        <div className={styles.level} style={{ backgroundColor: uvIndex >= 4 ? '#88d453' : '' }}></div>
        <div className={styles.level} style={{ backgroundColor: uvIndex >= 3 ? '#5bc14e' : '' }}></div>
        <div className={styles.level} style={{ backgroundColor: uvIndex >= 2 ? '#39a74c' : '' }}></div>
        <div className={styles.level} style={{ backgroundColor: uvIndex >= 1 ? '#1d8f46' : '' }}></div>
        <div className={styles.level} style={{ backgroundColor: uvIndex >= 0 ? '#006f39' : '' }}></div>
      </div>

      {/* Dettagli UV */}
      <div className={styles.uvDetails}>
        <div>
          <b>UV Index</b>
          <p>{uvIndex}</p>
        </div>
        <div>
          <b>UV Risk</b>
          <p>{uvRisk}</p>
        </div>
        <div>
          <b>Solar</b>
          <p>{uvSolar}</p>
        </div>
      </div>
    </div>
  );
};

export default UVPyramid;
