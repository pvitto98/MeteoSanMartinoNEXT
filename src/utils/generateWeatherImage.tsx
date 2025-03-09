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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato'];
  const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName} ${day} ${monthName} ${year}`;
}

export async function generateWeatherImage2({
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
  const width = 1680;
  const height = 1260;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Load background image
  const bgPath = path.join(process.cwd(), 'public', 'background.jpg');
  const background = await loadImage(bgPath);
  ctx.drawImage(background, 0, 0, width, height);

  // Darken the background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, width, height);

  // Main container
  const containerWidth = width - 600; // Shrink more from the sides
  const containerHeight = 580;
  const containerX = (width - containerWidth) / 2;
  const containerY = (height - containerHeight) / 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // More on the white side
  ctx.roundRect(containerX, containerY, containerWidth, containerHeight, 50);
  ctx.fill();

  // Date
  const formattedDate = formatDate(date);
  ctx.fillStyle = '#616161'; // Change text color
  ctx.font = 'bold 25px Rubik';
  ctx.fillText(formattedDate, width - 630, containerY + 100);

  // Weather icon (optional)
  if (imgFileName) {
    try {
      const imagePath = path.join(process.cwd(), 'public', imgFileName);
      const image = await loadImage(imagePath);
      // ctx.drawImage(image, containerX + 10, containerY + 10, 100, 100);
    } catch (err) {
      console.error('Error loading weather icon:', err);
    }
  }

  // Temperature
  ctx.font = 'bold 25px Rubik';
  ctx.fillText('Temperatura media', containerX + 100, containerY + 100);
  ctx.font = 'bold 125px Rubik'; // Increase font size
  ctx.fillText(`${tempMed}°C`, containerX + 80, containerY + 220);
  ctx.font = 'bold 25px Rubik'; // Slightly higher font size
  ctx.fillText(`Min: ${tempMin}°C`, containerX + 100, containerY + 260);
  ctx.fillText(`Max: ${tempMax}°C`, containerX + 250, containerY + 260); // Side by side

  // Pressure
  ctx.font = 'bold 25px Rubik';
  // ctx.fillText(`Pressione: [${pressioneMin},${pressioneMax}] hPa`, containerX + containerWidth - 400, containerY + 260);

  // Weather data with icons
  const icons = ['wind.png', 'pm25.png', 'rain.png'];
  const labels = ['Raffica max', ' PM2.5 Med.', '   Pioggia'];
  const values = [`${raffica}`, `${pm25}`, `${pioggia}`];
  const units = ['km/h', 'µg/m³', 'mm'];
  const measurementWidth = 330; // Set a fixed width for each measurement

  for (let i = 0; i < values.length; i++) {
    const iconPath = path.join(process.cwd(), 'public', icons[i]);
    try {
      const icon = await loadImage(iconPath);
      ctx.drawImage(icon, containerX + 200 + i * measurementWidth, containerY + 330, 50, 50);
    } catch (err) {
      console.error('Error loading icon:', err);
    }
    ctx.font = 'normal 30px Rubik'; // Normal font for labels
    ctx.fillText(labels[i], containerX + 150 + i * measurementWidth, containerY + 420);
    ctx.font = 'bold 35px Rubik'; // Bold font for values
    ctx.fillText(values[i], containerX + 170 + i * measurementWidth, containerY + 470);
    ctx.font = 'normal 28px Rubik'; // Normal font for units
    ctx.fillText(units[i], containerX + 170 + i * measurementWidth + ctx.measureText(values[i]).width + 20, containerY + 470);
  }

  // Footer text
  ctx.font = 'bold 25px Rubik';
  ctx.fillStyle = '#616161';
  ctx.fillText('Segui la pagina Meteo San Martino Delle Scale!', containerX + 500, containerY + containerHeight - 30);


    // // Caricare immagine dalla cartella public
    // if (imgFileName) {
    //   try {
    //     const imagePath = path.join(process.cwd(), 'public', imgFileName);
    //     const image = await loadImage(imagePath);
    //     const imgSize = 200;
    //     ctx.drawImage(image, 50, 10, imgSize, imgSize);
    //   } catch (err) {
    //     console.error('Errore nel caricamento immagine:', err);
    //   }
    // }
  return canvas.toBuffer('image/png');
}

