import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import React from 'react';

// Register the required components from Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface SolarRadiationChartProps {
  data: { date: string, value: string }[]; // Transformed data with date and value
}

const SolarRadiationChart: React.FC<SolarRadiationChartProps> = ({ data }) => {
  // Prepare the data for chart.js
  const radiationValues = data.map(item => parseFloat(item.value));
  const timestamps = data.map(item => item.date);

  // Find the sunrise index: first index where the value is exactly 0
  const sunriseIndex = radiationValues.findIndex(value => value > 0);

  // Find the dawn index: the last index with a value > 0 that has at least one zero after it.
  let dawnIndex = -1;
  for (let i = radiationValues.length - 1; i >= 0; i--) {
    if (radiationValues[i] > 0 && radiationValues.slice(i + 1).includes(0)) {
      dawnIndex = i;
      break;
    }
  }

  // Create filtered labels: only keep labels for sunrise and dawn; others are empty.
  // For sunrise and dawn, we convert the timestamp to show "alba" and "tramonto" on separate lines from the time.
  const filteredLabels = timestamps.map((timestamp, index) => {
    if (index === sunriseIndex) {
      const dateObj = new Date(timestamp);
      return `alba\n${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    }
    if (index === dawnIndex) {
      const dateObj = new Date(timestamp);
      return `tramonto\n${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    }
    return '';
  });

  const chartData = {
    labels: filteredLabels,
    datasets: [
      {
        label: 'Solar Radiation (W/m²)',
        data: radiationValues,
        borderColor: '#757575',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.5, // Increase tension for smoother curves
        borderWidth: 1,
        pointRadius: 0,
        pointBackgroundColor: '#757575'
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: false },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.raw} W/m²`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        ticks: { autoSkip: false, maxRotation: 0, minRotation: 0 }, // Ensure labels are not tilted
        grid: { display: false }
      },
      y: {
        display: false,
        grid: { display: false },
        ticks: { display: false }
      }
    
    }
  };

  

  return (
    <div style={{ width: '250px', height: '150px' }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default SolarRadiationChart;
