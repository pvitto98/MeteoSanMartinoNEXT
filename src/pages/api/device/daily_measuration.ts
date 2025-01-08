import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// Type for Wunder API response
type WunderResponseType = {
  observations: {
    metric: {
      tempHigh: number;
      tempLow: number;
      tempAvg: number;
      windspeedHigh: number;
      windspeedLow: number;
      windspeedAvg: number;
      windgustHigh: number;
      windgustLow: number;
      windgustAvg: number;
      dewptHigh: number;
      dewptLow: number;
      dewptAvg: number;
      windchillHigh: number;
      windchillLow: number;
      windchillAvg: number;
      heatindexHigh: number;
      heatindexLow: number;
      heatindexAvg: number;
      pressureMax: number;
      pressureMin: number;
      pressureTrend: number;
      precipRate: number;
      precipTotal: number;
      winddirAvg: number;
      humidityHigh: number;
      humidityLow: number;
      humidityAvg: number;
    };
    solarRadiationHigh: number;
    uvHigh: number;
    epoch: number;
  }[];
};

// Type for Ecowitt API response
type EcowittResponseType = {
  data: {
    lightning?: {
      count: {
        list: { [timestamp: string]: string };
      };
    };
    pm25_ch1?: {
      pm25: {
        list: { [timestamp: string]: string };
      };
    };
  };
};


// Format date in the 'YYYYMMDD' format (same as in Python script)
const formatDate = (date: string) => {
  // Ensure that the date string is not empty and matches the expected 'YYYYMMDD' format
  if (!date || !/^\d{8}$/.test(date)) {
    throw new Error(`Invalid date string: ${date}`);
  }

  // Extract year, month, and day from the 'YYYYMMDD' string
  const year = parseInt(date.substring(0, 4), 10);
  const month = parseInt(date.substring(4, 6), 10) - 1; // JavaScript months are 0-indexed
  const day = parseInt(date.substring(6, 8), 10);

  // Create a new Date object from the extracted components
  const dateObj = new Date(year, month, day);

  // Check if the date object is valid
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid Date: ${date}`);
  }

  // Return the date formatted as 'YYYYMMDD'
  return dateObj.toISOString().split('T')[0].replace(/-/g, '');
};

// Define your function to get data from Ecowitt and Wunder APIs
const getDataFromAPIs = async (date: string) => {
  const wunderAPI = "https://api.weather.com/v2/pws/history/daily";
  const ecowittAPI = "https://api.ecowitt.net/api/v3/device/history";

  const formattedDate = formatDate(date);


  try {
    // Fetch data from Wunder API
    const wunderResponse = await axios.get(wunderAPI, {
      params: {
        stationId: "IMONRE13",  // Station ID for Wunder API
        apiKey: process.env.WUNDER_API_KEY,  // API Key from environment variable
        format: "json",  // Response format
        units: "m",  // Units for the data
        numericPrecision: "decimal",  // Numeric precision for the data
        date: formattedDate,  // Date parameter passed in the query
      },
    });
    const wunderData = wunderResponse.data;

    // Fetch data from Ecowitt API
    const ecowittResponse = await axios.get(ecowittAPI, {
      params: {
        application_key: process.env.ECOWITT_APPLICATION_KEY,  // Application key for Ecowitt API
        api_key: process.env.ECOWITT_API_KEY,  // API key for Ecowitt API
        mac: "54:32:04:43:1E:24",  // Example MAC address (use your actual MAC address here)
        call_back: "lightning,pm25_ch1",  // Callback for required data
        wind_speed_unitid: 7,  // Wind speed unit ID
        cycle_type: "auto",  // Cycle type for data collection
        start_date: `${date} 00:00:00`,  // Start of the day
        end_date: `${date} 23:59:59`,  // End of the day
      },
    });
    const ecowittData = ecowittResponse.data;

    return { wunderData, ecowittData };
  } catch (error) {

    // Check if error has response data
    if ((error as AxiosError).response) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error('API Response Error:', axiosError.response.data);
        console.error('API Response Status:', axiosError.response.status);
        console.error('API Response Headers:', axiosError.response.headers);
      }
    } else if ((error as AxiosError).request) {
      console.error('No Response Received:', (error as AxiosError).request);
    } else {
      console.error('Error Message:', (error as Error).message);
    }

    throw new Error('Error fetching data from APIs');
  }
};

// Function to calculate the values from the raw data
const calculateValues = (wunderData: WunderResponseType, ecowittData: EcowittResponseType) => {
  // Extract Wunder data
  const tempHigh = wunderData?.observations[0]?.metric?.tempHigh || 0;
  const tempLow = wunderData?.observations[0]?.metric?.tempLow || 0;
  const tempAvg = wunderData?.observations[0]?.metric?.tempAvg || 0;
  const windspeedHigh = wunderData?.observations[0]?.metric?.windspeedHigh || 0;
  const windspeedLow = wunderData?.observations[0]?.metric?.windspeedLow || 0;
  const windspeedAvg = wunderData?.observations[0]?.metric?.windspeedAvg || 0;
  const windgustHigh = wunderData?.observations[0]?.metric?.windgustHigh || 0;
  const windgustLow = wunderData?.observations[0]?.metric?.windgustLow || 0;
  const windgustAvg = wunderData?.observations[0]?.metric?.windgustAvg || 0;
  const dewptHigh = wunderData?.observations[0]?.metric?.dewptHigh || 0;
  const dewptLow = wunderData?.observations[0]?.metric?.dewptLow || 0;
  const dewptAvg = wunderData?.observations[0]?.metric?.dewptAvg || 0;
  const windchillHigh = wunderData?.observations[0]?.metric?.windchillHigh || 0;
  const windchillLow = wunderData?.observations[0]?.metric?.windchillLow || 0;
  const windchillAvg = wunderData?.observations[0]?.metric?.windchillAvg || 0;
  const heatindexHigh = wunderData?.observations[0]?.metric?.heatindexHigh || 0;
  const heatindexLow = wunderData?.observations[0]?.metric?.heatindexLow || 0;
  const heatindexAvg = wunderData?.observations[0]?.metric?.heatindexAvg || 0;
  const pressureMax = wunderData?.observations[0]?.metric?.pressureMax || 0;
  const pressureMin = wunderData?.observations[0]?.metric?.pressureMin || 0;
  const pressureTrend = wunderData?.observations[0]?.metric?.pressureTrend || 0;
  const precipRate = wunderData?.observations[0]?.metric?.precipRate || 0;
  const precipTotal = wunderData?.observations[0]?.metric?.precipTotal || 0;
  const timestamp = wunderData?.observations[0]?.epoch || 0;
  const solarRadiationHigh = wunderData?.observations[0]?.solarRadiationHigh || 0;
  const uvHigh = wunderData?.observations[0]?.uvHigh || 0;
  const winddirAvg = wunderData?.observations[0]?.metric?.winddirAvg || 0;
  const humidityHigh = wunderData?.observations[0]?.metric?.humidityHigh || 0;
  const humidityLow = wunderData?.observations[0]?.metric?.humidityLow || 0;
  const humidityAvg = wunderData?.observations[0]?.metric?.humidityAvg || 0;

  // Extract Ecowitt data
  const lightningCount =
    ecowittData?.data?.lightning?.count?.list
      ? Math.max(...Object.values(ecowittData.data.lightning.count.list).map(Number))
      : 0;

  const pm25List = ecowittData?.data?.pm25_ch1?.pm25?.list || {};

  const calculatePM25Values = (pm25list: { [timestamp: string]: string }) => {
    const pm25Values = Object.values(pm25list).map((value) => parseFloat(value));
    const min = Math.min(...pm25Values);
    const max = Math.max(...pm25Values);
    const avg = pm25Values.reduce((acc, val) => acc + val, 0) / pm25Values.length;

    return { min, max, avg };
  };

  const pm25Stats = calculatePM25Values(pm25List);

  return {
    tempHigh,
    tempLow,
    tempAvg,
    windspeedHigh,
    windspeedLow,
    windspeedAvg,
    windgustHigh,
    windgustLow,
    windgustAvg,
    dewptHigh,
    dewptLow,
    dewptAvg,
    windchillHigh,
    windchillLow,
    windchillAvg,
    heatindexHigh,
    heatindexLow,
    heatindexAvg,
    pressureMax,
    pressureMin,
    pressureTrend,
    precipRate,
    precipTotal,
    timestamp,
    solarRadiationHigh,
    uvHigh,
    winddirAvg,
    humidityHigh,
    humidityLow,
    humidityAvg,
    lightningCount,
    pm25Avg: pm25Stats.avg,
    pm25Max: pm25Stats.max,
    pm25Min: pm25Stats.min,
  };
};

// Function to get yesterday's date formatted as 'YYYYMMDD'
// Function to get yesterday's date in Rome time zone formatted as 'YYYYMMDD'
const getYesterdayDateRome = () => {
  // Get the current date and time in Rome time zone
  const now = new Date();
  const romeDate = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  // Parse Rome's current date to extract year, month, and day
  const [day, month, year] = romeDate.split('/').map((part) => parseInt(part, 10));
  const romeCurrentDate = new Date(year, month - 1, day);

  // Subtract one day to get yesterday's date in Rome
  romeCurrentDate.setDate(romeCurrentDate.getDate() -1);

  // Format yesterday's date as 'YYYYMMDD'
  const formattedDate = romeCurrentDate.toISOString().split('T')[0].replace(/-/g, '');

  console.log("Yesterday's date in Rome time zone:", formattedDate);
  return formattedDate;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Handler called");
  try {
    // If date parameter is not provided, use yesterday's date
    const targetDate = getYesterdayDateRome();

    // Extract day, month, and year from the targetDate
    const year = parseInt(targetDate.substring(0, 4), 10);
    const month = parseInt(targetDate.substring(4, 6), 10);
    const day = parseInt(targetDate.substring(6, 8), 10);

    // Fetch raw data from APIs
    const { wunderData, ecowittData } = await getDataFromAPIs(targetDate as string);

    // Calculate values for logging
    const calculatedValues = calculateValues(wunderData, ecowittData);

    // Log the calculated values to the console
    console.log('Calculated values:', calculatedValues);

    // Ensure calculatedValues is valid (not null or undefined)
    if (!calculatedValues || typeof calculatedValues !== 'object') {
      throw new Error('Calculated values are invalid');
    }

    // Save the data directly, including day, month, and year
    const savedData = await prisma.weatherData.create({
      data: {
        date: targetDate, // Set the date field
        day,             // Set the day field
        month,           // Set the month field
        year,            // Set the year field
        ...calculatedValues, // Set the calculated values
      },
    });

    // Respond with success and the saved data
    return res.status(200).json({ message: 'Data processed and logged successfully', data: savedData });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
