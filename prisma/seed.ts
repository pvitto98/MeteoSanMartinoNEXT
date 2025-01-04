import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Absolute path to the JSON file in the public directory
const filePath = path.join(__dirname, 'public', 'data.json'); // Adjust according to your project structure

const processFile = async () => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Rest of your code
    const formattedData = data.map((item: any) => ({
      ...item,
      year: parseInt(item.date.slice(0, 4)),
      month: parseInt(item.date.slice(4, 6)),
      day: parseInt(item.date.slice(6, 8)),
      lightningCount: item.lightningCount ?? -1, 
      pm25Avg: item.pm25Avg ?? -1,              
      pm25Max: item.pm25Max ?? -1,               
      pm25Min: item.pm25Min ?? -1,
    }));

    await prisma.weatherData.createMany({
      data: formattedData,
    });

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await prisma.$disconnect();
  }
};

processFile();




// // Absolute path to the JSON file (you can manually specify this if necessary)
// const filePath = 'C:/Users/pelli/OneDrive/Desktop/projects/meteo-sanmartino-next/prisma/data.json'; // Specify the correct path here

// const processFile = async () => {
//   try {
//     // Read and parse the JSON file
//     const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

//     // Map the data to match your Prisma model
//     const formattedData = data.map((item: any) => ({
//       ...item,
//       year: parseInt(item.date.slice(0, 4)),
//       month: parseInt(item.date.slice(4, 6)),
//       day: parseInt(item.date.slice(6, 8)),
//       lightningCount: item.lightningCount ?? -1, // If lightningCount is missing, set to -1
//       pm25Avg: item.pm25Avg ?? -1,               // If pm25Avg is missing, set to -1
//       pm25Max: item.pm25Max ?? -1,               // If pm25Max is missing, set to -1
//       pm25Min: item.pm25Min ?? -1,               // If pm25Min is missing, set to -1
//     }));

//     // Insert all data into the database
//     await prisma.weatherData.createMany({
//       data: formattedData,
//     });

//     console.log('Seeding complete!');
//   } catch (err) {
//     console.error('Error during seeding:', err);
//   } finally {
//     await prisma.$disconnect();
//   }
// };

// processFile();
