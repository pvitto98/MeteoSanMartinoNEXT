// import React from "react";
// import styled from "styled-components";
// import { PolarArea } from "react-chartjs-2";
// import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from "chart.js";

// // Registriamo i componenti di Chart.js
// ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

// const Container = styled.div`
//   width: 400px;
//   height: 400px;
// `;

// interface WindRoseChartProps {
//   windSpeed: number[];
//   windDirection: number[];
// }

// const WindRoseChart: React.FC<WindRoseChartProps> = ({ windSpeed, windDirection }) => {
//   const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

//   const data = {
//     labels,
//     datasets: [
//       {
//         label: "Wind Speed (km/h)",
//         data: windSpeed,
//         backgroundColor: [
//           "rgba(255, 99, 132, 0.2)",
//           "rgba(54, 162, 235, 0.2)",
//           "rgba(255, 206, 86, 0.2)",
//           "rgba(75, 192, 192, 0.2)",
//           "rgba(153, 102, 255, 0.2)",
//           "rgba(255, 159, 64, 0.2)",
//           "rgba(199, 199, 199, 0.2)",
//           "rgba(83, 102, 255, 0.2)",
//         ],
//         borderColor: [
//           "rgba(255, 99, 132, 1)",
//           "rgba(54, 162, 235, 1)",
//           "rgba(255, 206, 86, 1)",
//           "rgba(75, 192, 192, 1)",
//           "rgba(153, 102, 255, 1)",
//           "rgba(255, 159, 64, 1)",
//           "rgba(199, 199, 199, 1)",
//           "rgba(83, 102, 255, 1)",
//         ],
//         borderWidth: 1,
//       },
//     ],
//   };

//   return (
//     <Container>
//       <PolarArea data={data} />
//     </Container>
//   );
// };

// export default WindRoseChart;
