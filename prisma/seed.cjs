const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const processFile = async () => {
  try {
    // // Check if data already exists
    // const existingData = await prisma.weatherData.count();
    // if (existingData > 0) {
    //   console.log('Data already exists, skipping seeding.');
    //   return;
    // }

    // Path to the JSON data
    const filePath = path.join(process.cwd(), 'public', 'data.json'); // Modify as needed
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Map and insert data
    const formattedData = data.map((item) => ({
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
