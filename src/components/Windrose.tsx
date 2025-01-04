// import React, { useRef, useEffect } from 'react';
// import { Chart, registerables } from 'chart.js';
// Chart.register(...registerables);

// interface WindroseProps {
//   windData: {
//     windSpeed: { [key: string]: number };
//     windDirection: { [key: string]: number };
//   } | null;
// }

// const Windrose: React.FC<WindroseProps> = ({ windData }) => {
//   const chartRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     if (chartRef.current && windData) {
//       const ctx = chartRef.current.getContext('2d');
//       console.log(windData);
//       new Chart(ctx!, {
//         type: 'polarArea',
//         data: {
//           labels: Object.keys(windData.windDirection), // Use wind directions as labels
//           datasets: [{
//             label: 'Wind Speed',
//             data: Object.keys(windData.windDirection).map(key => windData.windSpeed[key]), // Match data with labels
//             backgroundColor: 'rgba(0, 123, 255, 0.5)',
//             borderColor: 'rgba(0, 123, 255, 1)',
//             borderWidth: 1
//           }]
//         },
//         options: {
//           responsive: true,
//           scales: {
//             r: {
//               beginAtZero: true
//             }
//           }
//         }
//       });
//     }
//   }, [windData]);

//   return (
//     <div>
//       <h2>Wind Rose</h2>
//       <canvas ref={chartRef}></canvas>
//     </div>
//   );
// };

// export default Windrose;
