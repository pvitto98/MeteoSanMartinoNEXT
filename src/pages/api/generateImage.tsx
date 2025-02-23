import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { generateWeatherImage } from '../../utils/generateWeatherImage';
import { getWeatherIcon } from '../../utils/getWeatherIcon';

const calculateAverage = (values: number[]) => {
  return values.reduce((acc, val) => acc + val, 0) / values.length;
};

const getYesterdayDates = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const startDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')} 00:00:00`;
  const endDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')} 23:59:59`;
  const displayDate = `${String(yesterday.getDate()).padStart(2, '0')}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${yesterday.getFullYear()}`;

  return { startDate, endDate, displayDate };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startDate, endDate, displayDate } = getYesterdayDates();

    // Ecowitt API URL
    const ecowittUrl = `https://api.ecowitt.net/api/v3/device/history`;

    // Making the API request with Axios
    const weatherData = await axios.get(ecowittUrl, {
      params: {
        application_key: process.env.ECOWITT_APPLICATION_KEY, // API application key (secure in environment variable)
        api_key: process.env.ECOWITT_API_KEY, // API key (secure in environment variable)
        mac: "54:32:04:43:1E:24", // Example MAC address for the device
        temp_unitid: 1, // Temperature unit ID (you can adjust if needed)
        rainfall_unitid: 12,
        pressure_unitid: 3,
        wind_speed_unitid: 7,
        start_date: startDate,
        end_date: endDate,
        call_back: "outdoor.temperature,pressure,rainfall,wind.wind_gust,pm25_ch1", // Weather-related fields
        cycle_type: "auto", // Set to auto for automatic cycling of data
      },
    });


    // console.log(weatherData.data.data);
    // console.log(JSON.stringify(weatherData.data, null, 2)); // Pretty-print the response for easy inspection

    // // // Extract temperature, pressure, rain, etc., from the data
    const temperatures = Object.values(weatherData.data.data.outdoor.temperature.list).map(Number);
    const pressures = Object.values(weatherData.data.data.pressure.relative.list).map(Number);
    const rainEvents = Object.values(weatherData.data.data.rainfall.event.list).map(Number);
    const rainRates = Object.values(weatherData.data.data.rainfall.rain_rate.list).map(Number);
    const windGustValues = Object.values(weatherData.data.data.wind.wind_gust.list).map(Number);
    const pm25 = Object.values(weatherData.data.data.pm25_ch1.pm25.list).map(Number);

    // Calculate the average values
    const tempMax = Math.max(...temperatures).toFixed(1);
    const tempMin = Math.min(...temperatures).toFixed(1);
    const tempMed = calculateAverage(temperatures).toFixed(1);
    const tempPressureMax = Math.max(...pressures).toFixed(1);
    const tempPressureMin = Math.min(...pressures).toFixed(1);
    const rainRate = calculateAverage(rainRates).toFixed(1);
    const pm25avg = calculateAverage(pm25).toFixed(1);

    const totalRain = Math.max(...rainEvents).toFixed(1)
    const windGustMax = Math.max(...windGustValues).toFixed(1);

    const result = [];
    const rainRateList = weatherData.data.data.rainfall.rain_rate.list;
    const dailyList = weatherData.data.data.rainfall.daily.list;

    const pressureVals = weatherData.data.data.pressure.relative.list;


    // Process rain rate data
    for (const timestamp in rainRateList) {
      result.push({
        timestamp: parseInt(timestamp),
        rain_rate: rainRateList[timestamp],
        pressure: pressureVals[timestamp], // Add pressure data
      });
    }

    // Process daily data
    for (const timestamp in dailyList) {
      result.push({
        timestamp: parseInt(timestamp),
        daily_rain: dailyList[timestamp],
        pressure: pressureVals[timestamp], // Add pressure data
      });
    }

    const iconCount: { [key: string]: number } = {}; // To store icon counts

    // Iterate over each data point
    result.forEach((entry) => {
      // Assuming lightning is null for now
      const { icon } = getWeatherIcon(
        20,    // UV index
        parseFloat(entry.rain_rate),  // Rain rate
        parseFloat(entry.pressure),  // Pressure
        null  // Lightning, set to null as per your requirement
      );
  
      // Increment the icon count
      iconCount[icon] = (iconCount[icon] || 0) + 1;
    });

    let mostFrequentIcon = '';
    let highestCount = 0;
    for (const [icon, count] of Object.entries(iconCount)) {
      if (count > highestCount) {
        mostFrequentIcon = icon;
        highestCount = count;
      }
    }
  

    // Generate the weather image
    const buffer = await generateWeatherImage({
      date: displayDate,
      tempMax: parseFloat(tempMax),
      tempMin: parseFloat(tempMin),
      tempMed: parseFloat(tempMed),
      raffica: parseFloat(windGustMax),
      pioggia: parseFloat(totalRain),
      rateOra: parseFloat(rainRate), 
      pressioneMax: parseFloat(tempPressureMax),
      pressioneMin: parseFloat(tempPressureMin),
      pm25: parseFloat(pm25avg), 
      imgFileName: mostFrequentIcon,
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error("Error fetching device history:", error); // Log the error if it occurs
    res.status(500).json({ error: "Failed to fetch device history" }); // Return an error status
  }
}
