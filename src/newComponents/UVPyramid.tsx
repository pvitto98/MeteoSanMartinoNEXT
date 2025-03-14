import React from 'react';
import styles from './UVPyramid.module.css';

type UVPyramidProps = {
  uvIndex: number;
  uvRisk: string;
  uvSolar: number;
};

// Correct order: bottom to top
const segmentColors = ["#F5F5F5", "#E0E0E0", "#D6D6D6", "#BDBDBD", "#9E9E9E", "#808080"];
const textColors = ["#000000", "#000000", "#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF"]; // Ensures contrast

const UVPyramid: React.FC<UVPyramidProps> = ({ uvIndex, uvRisk }) => {
  // Find the highest active segment (ensuring it starts from the bottom)
  const activeSegmentIndex = Math.max(0, Math.min(segmentColors.length - 1, Math.floor((uvIndex - 1) / 2)));

  return (
    <div className={styles.uvPyramidContainer}>
      {/* UV Risk Box (on top) */}
      <div className={styles.uvRiskBox}>
        <span className={styles.uvRiskText}>{uvRisk}</span>
      </div>

      <div className={styles.pyramid}>
        {segmentColors.map((color, index) => {
          const isActive = uvIndex >= index * 2 + 1;

          return (
            <div key={index} className={styles.level} style={{ backgroundColor: isActive ? color : '' }}>
              {index === activeSegmentIndex && (
                <span className={styles.uvIndex} style={{ color: textColors[index] }}>
                  {uvIndex}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* UV Risk Label */}
      <div className={styles.uvLabelContainer}>
        <span className={styles.uvLabel}>Rischio UV</span>
      </div>
    </div>
  );
};

export default UVPyramid;
