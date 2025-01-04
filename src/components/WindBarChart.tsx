// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';

// // Registriamo i componenti di Chart.js
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// interface WindData {
//   speed: number;
//   direction: number;
// }

// const WindBarChart: React.FC = () => {
//   const [windData, setWindData] = useState<WindData[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Funzione per recuperare i dati tramite chiamata API
//   useEffect(() => {
//     const fetchWindData = async () => {
//       try {
//         const response = await axios.get('https://api.ecowitt.net/api/v3/device/history', {
//           params: {
//             application_key: 'CD2B782A016DC3876775DBF408336BC0',
//             api_key: '2fef56c3-66bb-4959-93c7-afe1862bac39',
//             mac: '54:32:04:43:1E:24',
//             start_date: '2024-06-09 00:00:00',
//             end_date: '2024-07-09 23:59:59',
//             call_back: 'wind',
//             wind_speed_unitid: 7, // Unità di misura: km/h
//             cycle_type: 'auto',
//           },
//         });

//         const windSpeeds = response.data.wind.wind_speed.list;
//         const windDirections = response.data.wind.wind_direction.list;

//         // Combiniamo le velocità del vento con le rispettive direzioni
//         const data: WindData[] = Object.keys(windSpeeds).map((key) => ({
//           speed: parseFloat(windSpeeds[key]),
//           direction: parseFloat(windDirections[key]),
//         }));

//         setWindData(data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Errore nel recupero dei dati del vento:', error);
//       }
//     };

//     fetchWindData();
//   }, []);

//   // Se i dati sono ancora in caricamento
//   if (loading) {
//     return <div>Caricamento dati del vento...</div>;
//   }

//   // Funzione per convertire la direzione del vento da gradi a punti cardinali
//   const getCardinalDirection = (angle: number) => {
//     const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
//     const index = Math.round(angle / 45) % 8;
//     return directions[index];
//   };

//   // Prepariamo i dati per il grafico
//   const chartData = {
//     labels: windData.map((data) => getCardinalDirection(data.direction)),
//     datasets: [
//       {
//         label: 'Velocità del Vento (km/h)',
//         data: windData.map((data) => data.speed),
//         backgroundColor: 'rgba(75, 192, 192, 0.2)',
//         borderColor: 'rgba(75, 192, 192, 1)',
//         borderWidth: 1,
//       },
//     ],
//   };

//   // Opzioni di configurazione del grafico
//   const chartOptions = {
//     scales: {
//       y: {
//         beginAtZero: true,
//         title: {
//           display: true,
//           text: 'Velocità (km/h)',
//         },
//       },
//       x: {
//         title: {
//           display: true,
//           text: 'Direzione del Vento',
//         },
//       },
//     },
//     plugins: {
//       legend: {
//         display: true,
//       },
//     },
//   };

//   return (
//     <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
//       <h2>Velocità e Direzione del Vento</h2>
//       <Bar data={chartData} options={chartOptions} />
//     </div>
//   );
// };

// export default WindBarChart;
