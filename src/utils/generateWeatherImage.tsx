import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

// Registra il font Rubik (assicurati che Rubik-Regular.ttf sia nella cartella public/fonts/)
registerFont(path.join(process.cwd(), 'public', 'fonts', 'Rubik-Regular.ttf'), { family: 'Rubik' });

const baseFontSize = 22; // Define the smallest font size

function formatDate(dateString: string): string {
  const [day, month, year] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const days = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato'];
  const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  return `${dayName} ${day} ${monthName} ${year}`;
}

export async function generateWeatherImage3({
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
  const width = 1500;
  const height = 1260;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Load background image
  const bgPath = path.join(process.cwd(), 'public', 'background.jpg');
  const background = await loadImage(bgPath);
  ctx.drawImage(background, 0, 0, width, height);

  // Darken the background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, width, height);

  // Main container
  const containerWidth = width - 400; // Shrink more from the sides
  const containerHeight = 380;
  const containerX = (width - containerWidth) / 2;
  const containerY = (height - containerHeight) / 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // More on the white side
  ctx.roundRect(containerX, containerY, containerWidth, containerHeight, 50);
  ctx.fill();

  // Date
  const formattedDate = formatDate(date);
  ctx.fillStyle = '#616161'; // Change text color
  ctx.font = `bold ${baseFontSize + 7}px Rubik`;
  ctx.fillText(formattedDate, width - 630, containerY + 70);

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
  ctx.font = `normal ${baseFontSize}px Rubik`;
  ctx.fillText('Temperatura media', containerX + 100, containerY + 100);

  // Gradient for tempMed
  ctx.font = `bold ${baseFontSize + 107}px Rubik`; // Increase font size
  const text = `${tempMed}°C`;
  const textWidth = ctx.measureText(text).width;
  const gradient = ctx.createLinearGradient(containerX + 80, containerY + 220, containerX + 80 + textWidth * 1.5, containerY + 220);
  gradient.addColorStop(0, '#296399');
  gradient.addColorStop(1, '#ffffff');

  // Draw shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  ctx.shadowBlur = 10;

  // Draw border
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#296399';
  ctx.strokeText(text, containerX + 80, containerY + 220);

  // Draw gradient text
  ctx.fillStyle = gradient;
  ctx.fillText(text, containerX + 80, containerY + 220);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;

  
  ctx.font = `normal ${baseFontSize + 2}px Rubik`; // Normal font for labels
  ctx.fillStyle = '#616161'; // Reset text color
  ctx.fillText('Tmin:', containerX + 100, containerY + 270);
  ctx.font = `bold ${baseFontSize + 4}px Rubik`; // Bold font for values
  ctx.fillText(`${tempMin}°C`, containerX + 170, containerY + 270);
  ctx.font = `normal ${baseFontSize + 2}px Rubik`; // Normal font for labels
  ctx.fillText('Tmax: ', containerX + 250, containerY + 270);
  ctx.font = `bold ${baseFontSize + 4}px Rubik`; // Bold font for values
  ctx.fillText(`${tempMax}°C`, containerX + 320, containerY + 270);

  // Weather data with icons
  const icons = ['wind.png', 'pm25.png', 'rain.png'];
  const labels = ['Raffica max', ' PM2.5 Med.', '    Pioggia'];
  const values = [`${raffica}`, ` ${pm25}`, `  ${pioggia}`];
  const units = ['km/h', 'µg/m³', 'mm'];
  const measurementWidth = 160; // Set a fixed width for each measurement
  const x = 600;
  const y = 220;
  for (let i = 0; i < values.length; i++) {
    const iconPath = path.join(process.cwd(), 'public', icons[i]);
    try {
      const icon = await loadImage(iconPath);
      ctx.drawImage(icon, containerX + x + 40 + i * measurementWidth, containerY + y - 75, 40, 40);
    } catch (err) {
      console.error('Error loading icon:', err);
    }
    ctx.font = `normal ${baseFontSize}px Rubik`; // Normal font for labels
    ctx.fillText(labels[i], containerX + x + i * measurementWidth, containerY + y);
    ctx.font = `bold ${baseFontSize + 8}px Rubik`; // Bold font for values
    ctx.fillText(values[i], containerX + x + 15 + i * measurementWidth, containerY + y + 40);
    ctx.font = `normal ${baseFontSize-2}px Rubik`; // Normal font for units
    ctx.fillText(units[i], containerX + x + 13 + i * measurementWidth + ctx.measureText(values[i]).width + 25, containerY + y + 40);
  }

  // Footer text
  ctx.font = `italic ${baseFontSize}px Rubik`;
  ctx.fillStyle = '#616161';
  ctx.fillText('Segui la pagina "Meteo San Martino Delle Scale"!', containerX + 320, containerY + containerHeight - 30);

  return canvas.toBuffer('image/png');
}

