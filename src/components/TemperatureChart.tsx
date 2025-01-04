// import React from "react";
// import { Line } from "react-chartjs-2";
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
// import styles from './TemperatureChart.module.css';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// type TemperatureChartProps = {
//   data: {
//     temperature: {
//       list: { [key: string]: string };
//     };
//     feels_like: {
//       list: { [key: string]: string };
//     };
//     dew_point: {
//       list: { [key: string]: string };
//     };
//   } | null;
// };

// const TemperatureChart: React.FC<TemperatureChartProps> = ({ data }) => {
//   if (!data) return null;

//   const labels = Object.keys(data.temperature.list).map(timestamp => 
//     new Date(Number(timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//   );
//   const temperatureData = Object.values(data.temperature.list).map(Number);
//   const feelsLikeData = Object.values(data.feels_like.list).map(Number);
//   const dewPointData = Object.values(data.dew_point.list).map(Number);

//   // Calculate max and min temperature values
//   const maxTemperature = Math.max(...temperatureData);
//   const minTemperature = Math.min(...temperatureData);

//   // Create arrays for max and min datasets, repeating the max/min value for each label
//   const maxData = Array(labels.length).fill(maxTemperature);
//   const minData = Array(labels.length).fill(minTemperature);

//   const chartData = {
//     labels,
//     datasets: [
//       {
//         label: 'Temperature',
//         data: temperatureData,
//         borderColor: '#FFD700',
//         backgroundColor: 'transparent',
//         borderWidth: 2,
//         pointRadius: 0,
//       },
//       {
//         label: 'Feels Like',
//         data: feelsLikeData,
//         borderColor: '#00BFFF',
//         backgroundColor: 'transparent',
//         borderWidth: 2,
//         pointRadius: 0,
//       },
//       {
//         label: 'Dew Point',
//         data: dewPointData,
//         borderColor: '#7FFF00',
//         backgroundColor: 'transparent',
//         borderWidth: 2,
//         pointRadius: 0,
//       },
//       {
//         label: 'Max Temperature',
//         data: maxData,
//         borderColor: '#FF4500', // Distinct color for max
//         backgroundColor: 'transparent',
//         borderWidth: 2,
//         pointRadius: 0,
//         borderDash: [5, 5], // Dashed line
//       },
//       {
//         label: 'Min Temperature',
//         data: minData,
//         borderColor: '#1E90FF', // Distinct color for min
//         backgroundColor: 'transparent',
//         borderWidth: 2,
//         pointRadius: 0,
//         borderDash: [5, 5], // Dashed line
//       },
//     ],
//   };

//   return (
//     <div className={styles.chartContainer}>
//       <Line 
//         data={chartData} 
//         options={{
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             legend: {
//               display: true,
//               position: 'top',
//               labels: {
//                 color: 'white',
//               },
//             },
//             tooltip: {
//               enabled: true,
//               callbacks: {
//                 label: function (context) {
//                   return `${context.dataset.label}`; // Show only the label
//                 },
//               },
//             },
//           },
//           scales: {
//             x: {
//               ticks: {
//                 color: 'white',
//               },
//               grid: {
//                 display: false, // Remove x gridlines
//               },
//             },
//             y: {
//               ticks: {
//                 color: 'white',
//               },
//               grid: {
//                 display: false, // Remove y gridlines
//               },
//             },
//           },
//           layout: {
//             padding: {
//               top: 5,
//               bottom: 0,
//               left: 5,
//               right: 5,
//             },
//           },
//         }} 
//       />
//     </div>
//   );
  
// };

// export default TemperatureChart;
