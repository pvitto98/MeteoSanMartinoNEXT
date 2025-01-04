// import { FunctionComponent } from "react";
// import { MapContainer, TileLayer, Circle as LeafletCircle, Popup, useMap } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import styles from "./Fulmini.module.css";

// export type FulminiProps = {
//   lightningData: { [key: string]: string }; // Ensure all values are strings
//   conteggio: number;
//   myCoords: { lat: number; lon: number };
//   className?: string;
// };

// const Fulmini: FunctionComponent<FulminiProps> = ({
//   lightningData = {},  // Default to an empty object to avoid null/undefined issues
//   conteggio,
//   myCoords,
//   className = "",
// }) => {
//   console.log("Fulmini Lightning Data:", lightningData);

//   const renderLightningCircles = () => {
//     // Verifica se lightningData è valido e non vuoto
//     if (!lightningData || Object.keys(lightningData).length === 0) {
//       return null;  // Nessun fulmine da mostrare
//     }

//     return Object.entries(lightningData).map(([timestamp, distance], index) => {
//       if (typeof distance !== 'string' || distance === '-') {
//         return null;  // Ignora dati non validi
//       }

//       const radiusInKm = parseFloat(distance) * 1.60934; // Converti miglia in chilometri
//       const radiusInMeters = radiusInKm * 1000; // Converti chilometri in metri

//       // Converte il timestamp in un formato leggibile
//       const date = new Date(Number(timestamp) * 1000); // Converte secondi in millisecondi
//       const timeString = date.toLocaleString(); // Formatta la data

//       return (
//         <LeafletCircle
//           key={index}
//           center={[myCoords.lat, myCoords.lon]}
//           radius={radiusInMeters}
//           pathOptions={{ color: "yellow", weight: 2 }}
//         >
//           <Popup>
//             <div>
//               <strong>Distanza:</strong> {radiusInKm.toFixed(2)} km<br />
//               <strong>Ora:</strong> {timeString}
//             </div>
//           </Popup>
//         </LeafletCircle>
//       );
//     });
//   };

//   const SetMapCenter = ({ coords }: { coords: { lat: number; lon: number } }) => {
//     const map = useMap();
//     map.setView([coords.lat, coords.lon], 10);
//     return null;
//   };

//   return (
//     <div className={[styles.fulmini, className].join(" ")}>
//       {/* <h2 className={styles.fulmini1}>Fulmini</h2> */}
//       <div className={styles.lightningMap}>
//         <MapContainer
//           zoom={10}
//           style={{ height: "100%", width: "100%" }}
//         >
//           <SetMapCenter coords={myCoords} />
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           />
//           {renderLightningCircles()} {/* Renderizza i cerchi dei fulmini */}
//         </MapContainer>
//         <div className={styles.frameParent}>
//         <div className={styles.conteggioParent}>
//           <b className={styles.conteggio}>Fulmini</b>
//           <b className={styles.b}>{conteggio}</b>
//         </div>
//       </div>
//       </div>

//     </div>
//   );
// };

// export default Fulmini;
