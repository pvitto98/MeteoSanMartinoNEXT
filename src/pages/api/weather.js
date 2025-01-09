import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const { year, month } = req.query;

    if (!year) {
      return res.status(400).json({ message: 'Year is required to fetch weather data.' });
    }

    const whereClause = { year: parseInt(year, 10) };
    if (month) whereClause.month = parseInt(month, 10);

    const weatherData = await prisma.weatherData.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });

    await prisma.$disconnect();

    console.log(weatherData.length)

    res.status(200).json({ weatherData });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weather data', error: error.message });
  }
}
