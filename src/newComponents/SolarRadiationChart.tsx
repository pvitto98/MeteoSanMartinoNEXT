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

  // Find the sunrise index (first value > 0)
  const sunriseIndex = radiationValues.findIndex(value => value > 0);
  const sunriseTime = sunriseIndex !== -1 ? timestamps[sunriseIndex] : null;

  // Find the dawn index (last value > 0 followed by at least one zero)
  let dawnIndex = -1;
  for (let i = radiationValues.length - 1; i >= 0; i--) {
    if (radiationValues[i] > 0 && radiationValues.slice(i + 1).includes(0)) {
      dawnIndex = i;
      break;
    }
  }
  const dawnTime = dawnIndex !== -1 ? timestamps[dawnIndex] : null;

  // Filter out zero values to clean up the graph
  const filteredData = data.filter(item => parseFloat(item.value) > 0);
  const filteredTimestamps = filteredData.map(item => item.date);
  const filteredValues = filteredData.map(item => parseFloat(item.value));

  const chartData = {
    labels: filteredTimestamps,
    datasets: [
      {
        label: 'Solar Radiation (W/m²)',
        data: filteredValues,
        borderColor: '#757575',
        backgroundColor: '#757575', // Slightly transparent fill color
        fill: "start", // Ensures the area below the line is filled
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
        display: false,
        ticks: { autoSkip: false, maxRotation: 0, minRotation: 0 },
        grid: { display: false }
      },
      y: {
        min: 0, // Ensures fill has a base reference point
        display: false,
        grid: { display: false },
        ticks: { display: false }
      }
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '--:--';

    // Manually parse the time string
    const [hours, minutes] = time.split(':');  // Assuming time is in "hh:mm" format
  
    return `${hours.padStart(2, '0').split(" ")[1]}:${minutes.padStart(2, '0')}`;
  };


  
  

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {/* Alba & Tramonto Box */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '130px',
        border: '2px solid #ccc',
        borderRadius: '5px',
        padding: '5px',
        fontSize: '10px',
        color: '#757575',
        textAlign: 'center'
      }}>
        <div style={{ flex: 1, borderRight: '1px solid #ccc' }}>
          <strong>Alba</strong>
          <br />
          {formatTime(sunriseTime)}
        </div>
        <div style={{ flex: 1 }}>
          <strong>Tramonto</strong>
          <br />
          {formatTime(dawnTime)}
        </div>
      </div>

      {/* Chart Box */}
      <div style={{ width: '150px', height: '100px', border: '2px solid #ccc', borderRadius: '5px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Label under the graph */}
      <span style={{ fontSize: '12px', color: '#757575' }}>Andamento della luce</span>
    </div>
  );
};

export default SolarRadiationChart;
