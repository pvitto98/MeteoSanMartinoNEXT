import React from 'react';
import styles from './TemperatureChart.module.css';

const TemperatureChart = () => {
  const data = [
    { time: '6:00 am', temp: 12 },
    { time: '9:00 am', temp: 15 },
    { time: '12:00 pm', temp: 30 },
    { time: '3:00 pm', temp: 28 },
    { time: '6:00 pm', temp: 18 },
    { time: '9:00 pm', temp: 14 },
  ];

  const maxTempPoint = data.reduce((max, point) =>
    point.temp > max.temp ? point : max
  );

  const maxTemp = maxTempPoint.temp;
  const width = 100; // Percentage width
  const height = 120; // SVG height

  // Generate smooth path data using cubic Bezier curves
  const getPathData = () => {
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (point.temp / maxTemp) * (height - 20); // Add padding at the top
      return [x, y];
    });

    let path = `M ${points[0][0]},${points[0][1]}`; // Move to the first point

    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[i + 1];

      // Calculate control points for the Bezier curve
      const cp1x = x1 + (x2 - x1) / 3;
      const cp1y = y1;
      const cp2x = x1 + (2 * (x2 - x1)) / 3;
      const cp2y = y2;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
    }

    return path;
  };

  // Calculate label position
  const labelPosition = {
    left: `${(data.indexOf(maxTempPoint) / (data.length - 1)) * 100}%`,
    bottom: `${height - (maxTempPoint.temp / maxTemp) * (height - 20) + 200}px`, // Increased space between label and line
  };

  return (
    <section className={styles.chartContainer} aria-labelledby="temperature-title">
      <h2 id="temperature-title" className={styles.chartTitle}>Andamento delle temperature</h2>
      <div className={styles.chartWrapper}>
        <svg className={styles.chart} viewBox="0 0 100 120" preserveAspectRatio="none">
          {/* Gradient Fill */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(128, 128, 128, 0.5)" />
              <stop offset="100%" stopColor="rgba(128, 128, 128, 0)" />
            </linearGradient>
          </defs>

          {/* Filled area under the curve */}
          <path
            d={`M 0,120 ${getPathData()} L 100,120 L 0,120 Z`}
            fill="url(#gradient)"
            className={styles.gradientPath}
          />

          {/* Curved line */}
          <path d={getPathData()} fill="none" className={styles.linePath} />
        </svg>

        {/* Label for the maximum temperature */}
        <div className={styles.maxLabel} style={labelPosition}>
          <div className={styles.labelContent}>
            <span>{maxTempPoint.time}</span>
            <strong>{`${maxTempPoint.temp}°`}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TemperatureChart;
