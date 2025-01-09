import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const distinctYears = await prisma.weatherData.findMany({
      select: { year: true },
      distinct: ['year'],
    });

    const years = distinctYears.map((data) => data.year.toString());
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    await prisma.$disconnect();

    res.status(200).json({ years, months });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching metadata', error: error.message });
  }
}
