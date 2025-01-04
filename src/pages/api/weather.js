import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const weatherData = await prisma.weatherData.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    // Extract unique years and months from the weather data
    const years = [...new Set(weatherData.map((data) => data.year.toString()))];
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    await prisma.$disconnect();

    res.status(200).json({ weatherData, years, months });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weather data', error: error.message });
  }
}
