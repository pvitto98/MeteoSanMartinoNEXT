// import { FunctionComponent } from "react";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import ChartDataLabels from 'chartjs-plugin-datalabels'; // Importa il plugin
// import styles from "./Pioggia.module.css";

// // Registrazione del plugin solo in Pioggia
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend); // Registra ChartDataLabels solo qui

// export type PioggiaType = {
//   className?: string;
//   todayRain: string;
//   weeklyRain: string;
//   monthlyRain: string;
//   annualRain: string;
//   eventRain: string;
//   rainRate: string;
// };

// const Pioggia: FunctionComponent<PioggiaType> = ({
//   className = "",
//   todayRain,
//   weeklyRain,
//   monthlyRain,
//   annualRain,
//   eventRain,
//   rainRate,
// }) => {
//   const data = {
//     labels: ["Evento", "Oggi", "Settimana", "Mese", "Anno"],
//     datasets: [
//       {
//         label: "Pioggia (mm)",
//         data: [
//           parseFloat(eventRain),
//           parseFloat(todayRain),
//           parseFloat(weeklyRain),
//           parseFloat(monthlyRain),
//           parseFloat(annualRain),
//         ],
//         backgroundColor: "rgba(75, 192, 192, 0.6)",
//         borderColor: "rgba(75, 192, 192, 1)",
//         borderWidth: 1,
//       },
//     ],
//   };

//   const options = {
//     scales: {
//       y: {
//         beginAtZero: true,
//         ticks: {
//           color: "white", // Colore per il testo dell'asse y
//         },
//       },
//       x: {
//         ticks: {
//           color: "white", // Colore per il testo dell'asse x
//         },
//       },
//     },
//     plugins: {
//       legend: {
//         display: false, // Nascondi la legenda
//       },
//       datalabels: {
//         color: "white", // Colore del testo sopra ogni barra
//         anchor: "end" as "end", // Forza il tipo per evitare errori
//         align: "end" as "end", // Forza il tipo per evitare errori
//         formatter: (value: number) => value.toFixed(1) + " mm", // Formattazione del testo
//       },
//     },
//     responsive: true,
//     maintainAspectRatio: false,
//   };

//   return (
//     <div className={[styles.pioggia, className].join(" ")}>
//       <div className={styles.pioggiaTitle}>PIOGGIA</div>
//       <div className={styles.barChartContainer}>
//         <Bar data={data} options={options} />
//       </div>
//       <div className={styles.rainRate}>
//         <div className={styles.rateh}>Rate/h</div>
//         <div className={styles.rainCountValues}>{rainRate} mm/h</div>
//       </div>
//     </div>
//   );
// };

// export default Pioggia;
