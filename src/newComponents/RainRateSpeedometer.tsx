import React from "react";
import ReactSpeedometer, { CustomSegmentLabelPosition } from "react-d3-speedometer";
import styles from './RainRateSpeedometer.module.css';

interface RainRateSpeedometerProps {
  rainRate: number;
}
const RainRateSpeedometer = ({ rainRate }: RainRateSpeedometerProps) => {
  const clampedRate = Math.min(rainRate, 60); // Limit the needle position

  const getRainLabel = (rate: number) => {
    if (rate === 0) return "";
    if (rate < 2) return "Pioviggine";
    if (rate < 5) return "Pioggia Debole";
    if (rate < 15) return "Pioggia Moderata";
    if (rate < 30) return "Pioggia Intensa";
    if (rate < 50) return "Pioggia Forte";
    return "Nubifragio";
  };

  return (
    <div className="flex flex-col items-center">
      <div className={styles['rain-rate-label']}>
        {getRainLabel(rainRate)}
      </div>
      <ReactSpeedometer
        maxValue={52}
        value={clampedRate}
        needleColor="#757575"
        startColor="#E0E0E0"
        endColor="#9E9E9E"
        width={155}
        height={105}
        needleHeightRatio={0.4}
        valueTextFontSize="14px"
        currentValueText={`${rainRate} mm/h`}
        
        /* Custom segment stops for different section widths */
        customSegmentStops={[0, 5, 15, 30, 50, 52]} 

        /* Colors per segment */
        segmentColors={["#F5F5F5", "#E0E0E0", "#D6D6D6", "#BDBDBD", "#9E9E9E", "#808080"]}
        customSegmentLabels={[
          { text: "", position: CustomSegmentLabelPosition.Outside, color: "#555", fontSize: "10px" },
          { text: "", position: CustomSegmentLabelPosition.Outside, color: "#555", fontSize: "10px" },
          { text: "", position: CustomSegmentLabelPosition.Outside, color: "#555", fontSize: "10px" },
          { text: "", position: CustomSegmentLabelPosition.Outside, color: "#555", fontSize: "10px" },
          { text: "", position: CustomSegmentLabelPosition.Outside, color: "#555", fontSize: "10px" }
        ]}

      />
      <div className={styles['rain-rate']}>Rate</div>
    </div>
  );
};


export default RainRateSpeedometer;
