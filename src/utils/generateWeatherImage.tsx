import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

// Registra il font Rubik (assicurati che Rubik-Regular.ttf sia nella cartella public/fonts/)
registerFont(path.join(process.cwd(), 'public', 'fonts', 'Rubik-Regular.ttf'), { family: 'Rubik' });

export async function generateWeatherImage({
  date,
  tempMax,
  tempMin,
  tempMed,
  raffica,
  pioggia,
  rateOra,
  pressioneMax,
  pressioneMin,
  pm25,
  imgFileName,
}: {
  date: string;
  tempMax: number;
  tempMin: number;
  tempMed: number;
  raffica: number;
  pioggia: number;
  rateOra: number;
  pressioneMax: number;
  pressioneMin: number;
  pm25: number;
  imgFileName?: string;
}): Promise<Buffer> {
  const width = 840;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Sfondo notturno
  ctx.fillStyle = '#1F2E54';
  ctx.fillRect(0, 0, width, height);

  // Stile del testo
  ctx.fillStyle = 'white';
  ctx.font = 'bold 25px Rubik';
  ctx.textAlign = 'left';

  // Data
  ctx.fillText(`${date}`, 630, 80);

  // Contenitore temperatura
  ctx.fillStyle = 'rgba(138, 141, 147, 0.1)';
  ctx.roundRect(50, 30, width-100 , 170, 40); // Increased height of the container
  ctx.fill();
  ctx.fillStyle = 'white';

  // Temperatura media (grande) a sinistra
  ctx.font = 'bold 80px Rubik';
  ctx.fillText(`${tempMed}°C`, 250, 130);

  // Min e Max (piccoli) sotto la media
  ctx.font = 'bold 20px Rubik';
  ctx.fillText(`Max: ${tempMax}°C`, 260, 180); // Placing it under the average
  ctx.fillText(`Min: ${tempMin}°C`, 260, 160); // Placing it under the average

  // Altri dati meteo
  ctx.font = 'bold 30px Rubik';
  const textLines = [
    `Raffica max: ${raffica} km/h`,
    `Pioggia: ${pioggia} mm | Rate max: ${rateOra} mm/h`,
    `Pressione: ${pressioneMin} - ${pressioneMax} hPa`,
    `PM2.5 medio: ${pm25} µg/m³`,
  ];

  textLines.forEach((line, index) => {
    ctx.fillText(line, 80, 290 + index * 60);
  });

  // Scritta finale
  ctx.font = 'bold 20px Rubik';
  ctx.fillStyle = '#ffcc00';
  ctx.fillText('Segui la pagina Meteo San Martino Delle Scale!', 380, height - 50);

  // Caricare immagine dalla cartella public
  if (imgFileName) {
    try {
      const imagePath = path.join(process.cwd(), 'public', imgFileName);
      const image = await loadImage(imagePath);
      const imgSize = 200;
      ctx.drawImage(image, 50, 10, imgSize, imgSize);
    } catch (err) {
      console.error('Errore nel caricamento immagine:', err);
    }
  }

  return canvas.toBuffer('image/png');
}
