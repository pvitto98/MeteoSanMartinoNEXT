import React from 'react';
import styles from './RainBar.module.css';

interface RainBarProps {
  dailyRain: number;
  monthlyRain: number;
}

const RainBar: React.FC<RainBarProps> = ({ dailyRain, monthlyRain }) => {
  const dailyPercentage = Math.min((dailyRain / monthlyRain) * 100, 100);

  // Get today's date
  const today = new Date();
  const currentMonth = today.getMonth(); // 0 - 11
  const date = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;

  // Month names
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  // Get current month's name
  const monthLabel = months[currentMonth];

  // Apply smaller font size for longer months
  const isLongMonth = monthLabel.length > 7; // Dicembre, Novembre, Settembre, etc.

  return (
    <div className={styles['rain-bar-container']}>
      {/* Monthly Rain Label (Top Right) */}
      <div className={styles['monthly-label']}>
        <span className={isLongMonth ? styles['small-font'] : ''}>{monthLabel}</span>
        <span className={styles['normal-text']}>
          <span className={styles['bold-text']}>{monthlyRain}</span> mm
        </span>
      </div>

      {/* Rain Bar */}
      <div className={styles['rain-bar']}>
        {/* Daily Rain Level */}
        <div
          className={styles['rain-wave']}
          style={{ 
            height: `${dailyPercentage}%`, 
            opacity: dailyRain === 0 ? 0 : 1, // Hide wave when no rain
          }}
        >
          {/* Animated Wave */}
          <svg
            className={styles['wave-svg']}
            viewBox="0 0 480 28" /* Double the width */
            preserveAspectRatio="none"
          >
            <path
              d="M0,20 Q120,0 240,20 T480,20 V28 H0 Z" /* Extended wave */
              fill="#c9e5ff"
            />
          </svg>
        </div>

        <div className={styles['daily-label']}>
          <span>Oggi</span>
          <span className={styles['normal-text']}>
            <span className={styles['bold-text']}>{dailyRain}</span> mm
          </span>
        </div>
      </div>

      <div className={styles['rain-rate']}>
        Precipitazioni
      </div>
    </div>
  );
};

export default RainBar;
