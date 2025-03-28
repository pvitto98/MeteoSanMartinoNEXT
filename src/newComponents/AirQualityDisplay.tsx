// components/AirQuality.tsx
import React, { useMemo } from 'react';

export interface AirQualityProps {
  aqi: number;
  pm25: number;
}

// Function to get the qualitative air quality label based on AQI value
function getAirQualityLabel(aqi: number): string {
  if (aqi <= 20) return "Ottima";
  if (aqi <= 50) return "Molto buona";
  if (aqi <= 80) return "Buona";
  if (aqi <= 100) return "Discreta";
  if (aqi <= 130) return "Accettabile";
  if (aqi <= 150) return "Mediocre";
  if (aqi <= 200) return "Scadente";
  if (aqi <= 250) return "Inquinata";
  if (aqi <= 300) return "Molto Inquinata";
  return "Pessima"; // For AQI > 300
}

// Helper function to decide how many clouds to show based on AQI.
function getCloudCount(aqi: number): number {
  if (aqi <= 20) return 0;
  if (aqi <= 50) return 1;
  if (aqi <= 80) return 2;
  if (aqi <= 100) return 3;
  if (aqi <= 130) return 4;
  if (aqi <= 150) return 5;
  if (aqi <= 200) return 6;
  if (aqi <= 250) return 7;
  if (aqi <= 300) return 8;
  return 9;
}

// A reusable SVG Cloud component
interface CloudProps {
  fill?: string;
}
const Cloud: React.FC<CloudProps> = ({ fill = "#888" }) => (
  <svg
    width="30"
    height="25"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="20" cy="25" r="10" fill={fill} />
    <circle cx="35" cy="20" r="12" fill={fill} />
    <circle cx="50" cy="25" r="10" fill={fill} />
    <ellipse cx="35" cy="30" rx="20" ry="10" fill={fill} />
  </svg>
);

interface CloudData {
  top: number;     // initial vertical position in percent
  left: number;    // initial horizontal position in percent
  dx: number;      // horizontal movement offset in percent
  dy: number;      // vertical movement offset in percent
  duration: number; // animation duration in seconds
  delay: number;    // animation delay in seconds
}

const AirQuality: React.FC<AirQualityProps> = ({ aqi, pm25 }) => {
  const cloudCount = getCloudCount(aqi);

  // Compute random positions and animation parameters for each cloud.
  const clouds = useMemo<CloudData[]>(
    () =>
      Array.from({ length: cloudCount }).map(() => ({
        top: Math.random() * 70 + 5,   // between 5% and 75%
        left: Math.random() * 70 + 5,  // between 5% and 75%
        dx: (Math.random() - 0.5) * 20, // move between -10% and +10%
        dy: (Math.random() - 0.5) * 20, // move between -10% and +10%
        duration: Math.random() * 20 + 10, // duration between 10s and 30s
        delay: Math.random() * 10,         // delay between 0s and 10s
      })),
    [cloudCount]
  );

  return (
    <div
      style={{
        position: 'relative',
        width: '100px',
        height: '150px',
        backgroundColor: '#c9e5ff', // Sky blue
        border: '2px solid #000',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Render each cloud with continuous, smooth movement */}
      {clouds.map((cloud, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            top: `${cloud.top}%`,
            left: `${cloud.left}%`,
            transform: 'translate(-50%, -50%)',
            animation: `moveCloud ${cloud.duration}s linear infinite`,
            animationDelay: `${cloud.delay}s`,
            // Set custom properties for the keyframes
            '--dx': `${cloud.dx}%`,
            '--dy': `${cloud.dy}%`,
          } as React.CSSProperties}
        >
          <Cloud fill="#888" />
        </div>
      ))}

      {/* Display air quality label */}
      <div
        style={{
          position: 'absolute',
          bottom: '5px',
          left: '5px',
          color: '#fff',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      >
        {getAirQualityLabel(aqi)}
      </div>

      {/* CSS for continuous and smooth cloud animation */}
      <style jsx>{`
        @keyframes moveCloud {
          0% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(var(--dx), var(--dy));
          }
          100% {
            transform: translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default AirQuality;
