"use client"

// pages/index.tsx
import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
import LoadingSpinner from "@/newComponents/LoadingSpinner";
import styles from "./index.module.css";
import { Rainfall } from "@/newComponents/Rainfall";
import { WeatherStats } from "@/newComponents/Wind";
import { UVStats } from "@/newComponents/UV";
import { AirQuality } from "@/newComponents/AirQuality";
import { WeatherCard } from "@/newComponents/Weather";
import RainRateSpeedometer from "@/newComponents/RainRateSpeedometer";
import RainBar from "@/newComponents/RainBar";
import SolarRadiationChart from "@/newComponents/SolarRadiationChart";
import UVPyramid from "@/newComponents/UVPyramid";




interface TimedValue {
  time: string;
  unit: string;
  value: string;
}

// Group outdoor-related data
interface OutdoorData {
  temperature: TimedValue;
  humidity: TimedValue;
  feels_like: TimedValue;
  dew_point: TimedValue;
  app_temp: TimedValue;
}

// Group indoor-related data
interface IndoorData {
  temperature: TimedValue;
  humidity: TimedValue;
}

// Group solar and UV-related data
interface SolarAndUVIData {
  solar: TimedValue;
  uvi: TimedValue;
}

// Group rainfall-related data
interface RainfallData {
  daily: TimedValue;
  weekly: TimedValue;
  monthly: TimedValue;
  yearly: TimedValue;
  event: TimedValue;
  hourly: TimedValue;
  rain_rate: TimedValue;
}

// Group wind-related data
interface WindData {
  wind_speed: TimedValue;
  wind_gust: TimedValue;
  wind_direction: TimedValue;
}

// Other specific sensors
interface PM25Data {
  real_time_aqi: TimedValue;
  pm25: TimedValue;
  "24_hours_aqi"?: TimedValue;
}

interface PressureData {
  absolute: TimedValue;
  relative: TimedValue;
}

interface LightningData {
  count: TimedValue;
  distance?: {
    list: Record<string, string>;
  };
}

// Main interface
interface DeviceData {
  outdoor?: OutdoorData;
  indoor?: IndoorData;
  solar_and_uvi?: SolarAndUVIData;
  rainfall?: RainfallData;
  wind?: WindData;
  pm25_ch1?: PM25Data;
  pressure?: PressureData;
  lightning?: LightningData;
  battery?: TimedValue;
  lightning_sensor?: TimedValue;
  pm25_sensor_ch1?: TimedValue;
  sensor_array?: TimedValue;
}

interface DateValue {
  date: string;  // Human-readable date
  value: string; // The corresponding value (could be a number or string)
}
interface SolarRadiationChartProps {
  data: { date: string, value: string }[]; // Transformed data with date and value
}

const Dashboard = () => {
  const [data, setData] = useState<DeviceData | null>(null);
  const [temperatureData, setTemperatureData] = useState<OutdoorData | null>(null);
  // const [lightningData, setLightningData] = useState<LightningData["distance"]["list"] | null>(null);
  const [windData, setWindData] = useState<WindData | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(() => getCurrentDateTime());
  const [solarData, setSolarDat] = useState<SolarRadiationChartProps | null>(null);
  const solarRadiationData = {
    1741820400: '0.0',
    1741820700: '0.0',
    1741821000: '0.0',
    // ... more data
    1741849500: '267.2',
    1741849800: '246.8',
    1741850100: '77.2',
  };

  
  // const router = useRouter();

  // Function to convert the object to an array of {date, value}
function transformData(data: DeviceData): DateValue[] {
  return Object.entries(data).map(([timestamp, value]) => {
    const date = new Date(parseInt(timestamp) * 1000).toLocaleString(); // Convert timestamp to date string
    return { date, value };
  });
}


  useEffect(() => {
    const fetchTemperatureData = async () => {
      const now = new Date();
      const startDate = formatDateTime(now, true);
      const endDate = formatDateTime(now, false);

      try {
        const response = await fetch(`/api/device/history?start_date=${startDate}&end_date=${endDate}`);
        const result = await response.json();
        console.log("response:");
        console.log(result.data.solar_and_uvi.solar.list);
        console.log(transformData(result.data.solar_and_uvi.solar.list));
        setTemperatureData(result.data.outdoor);
        // setLightningData(result.data.lightning?.distance.list);
        setWindData({
          wind_speed: result.data.wind.wind_speed,
          wind_direction: result.data.wind.wind_direction,
          wind_gust: result.data.wind.wind_gust,
        });
        setSolarDat({data: transformData(result.data.solar_and_uvi.solar.list)});
      } catch (error) {
        console.error("Error fetching temperature data:", error);
      }
    };

    fetchTemperatureData();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/device/real-time");
        const result = await response.json();
        console.log("data:");
        console.log(result.data);
        setData(result.data);
      } catch (error) {
        console.error("Error fetching real-time data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
      setCurrentDateTime(getCurrentDateTime());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  if (!data) {
    return <LoadingSpinner />;
  }

  const {
    outdoor,
    solar_and_uvi,
    rainfall,
    wind,
    pressure,
    lightning,
    pm25_ch1,
  } = data;

  // const filteredLightningData = Object.fromEntries(
  //   Object.entries(lightningData || {}).filter(([_, value]) =>
  //     typeof value === "string" && !isNaN(parseFloat(value))
  //   )
  // );

  const getMostRecentLightning = (lightningData: Record<string, string>) => {
    const currentTime = new Date();
    let recentLightning = null;
    console.log("getMostRecentLightning");
  
    for (const [time, value] of Object.entries(lightningData)) {
      console.log("entry");
      const lightningTime = new Date(time);
      console.log(time + lightningTime);
      const timeDifference = (currentTime.getTime() - lightningTime.getTime()) / (1000 * 60);
  
      if (timeDifference <= 30) {
        recentLightning = { time, value };
      }
    }
  
    return recentLightning;
  };

  console.log( lightning?.distance)

  const mostRecentLightning = getMostRecentLightning(lightning?.distance?.list || {});

  console.log("mostRecentLightning:" + mostRecentLightning);

  console.log(lightning)
  const uvRisk = determineUVRisk(parseFloat(solar_and_uvi?.uvi.value ?? "0"));

  return (
    <div className={styles.weatherContent}>
      <WeatherCard temperature={parseFloat(outdoor?.temperature.value ?? "0")} perceivedTemperature={parseFloat(outdoor?.feels_like.value ?? "0")} dewPoint={parseFloat(outdoor?.dew_point.value ?? "0")} humidity={parseFloat(outdoor?.humidity.value ?? "0")} pressure={parseFloat(pressure?.relative.value ?? "0")} rainRate={parseFloat(rainfall?.rain_rate.value ?? "0")} lightningCount={parseFloat(lightning?.count.value ?? "0")} uvSolar={parseFloat(solar_and_uvi?.solar.value ?? "0")} />
      <WeatherStats 
      windSpeed={parseFloat(wind?.wind_speed.value ?? "0")}
windDirection={parseFloat(wind?.wind_direction.value ?? "0")}
windGust={parseFloat(wind?.wind_gust.value ?? "0")} />
      <Rainfall  
      rate={parseFloat(rainfall?.rain_rate.value ?? "0")} dailyRain={parseFloat(rainfall?.daily.value ?? "0")} monthlyRain={parseFloat(rainfall?.monthly.value ?? "0")} />

      
      {solarData && <UVStats uvIndex={parseFloat(solar_and_uvi?.uvi.value ?? "0")} uvSolar={parseFloat(solar_and_uvi?.solar.value ?? "0")} solarData={solarData} />}
      <AirQuality  aqi={parseFloat(pm25_ch1?.real_time_aqi.value ?? "0")}  pm25={parseFloat(pm25_ch1?.pm25.value ?? "0")}/>
      {/* <TemperatureChart data={temperatureData}/> */}
    </div>
  );
};



// <div className={styles.content}>
// <div className={styles.fixedTemperatureCard}>
//   <Temperature
//     temperature={parseFloat(outdoor?.temperature.value ?? "0")}
//     perceivedTemperature={parseFloat(outdoor?.feels_like.value ?? "0")}
//     dewPoint={parseFloat(outdoor?.dew_point.value ?? "0")}
//     humidity={parseFloat(outdoor?.humidity.value ?? "0")}
//     pressure={parseFloat(pressure?.relative.value ?? "0")}
//     windSpeed={parseFloat(wind?.wind_speed.value ?? "0")}
//     windDirection={parseFloat(wind?.wind_direction.value ?? "0")}
//     day={currentDateTime.day}
//     time={currentDateTime.time}
//     rainRate={parseFloat(rainfall?.rain_rate.value ?? "0")}
//     lightningCount={parseFloat(lightning?.count.value ?? "0")}
//   />

// <WindDirection
// windSpeed={parseFloat(wind?.wind_speed.value ?? "0")}
// windDirection={parseFloat(wind?.wind_direction.value ?? "0")}
// windGust={parseFloat(wind?.wind_gust.value ?? "0")}
// />

// </div>

// <main className={styles.main}>
//   <div className={styles.gridContainer}>
//     {/* <TemperatureChart data={temperatureData} />
//     <Pioggia
//       todayRain={rainfall.daily.value}
//       weeklyRain={rainfall.weekly.value}
//       monthlyRain={rainfall.monthly.value}
//       annualRain={rainfall.yearly.value}
//       rainRate={rainfall.rain_rate.value}
//       eventRain={rainfall.event.value}
//     /> */}
// <PM25
// aqiValue={parseFloat(pm25_ch1?.real_time_aqi.value ?? "0")}
// pm25Value={parseFloat(pm25_ch1?.pm25.value ?? "0")}
// />

// <UVPyramid
// uvIndex={parseFloat(solar_and_uvi?.uvi.value ?? "0")}
// uvRisk={uvRisk}
// uvSolar={parseFloat(solar_and_uvi?.solar.value ?? "0")}
// />

// <WeatherForecast/>
//     {/* <Fulmini
//       lightningData={filteredLightningData as { [key: string]: string }}
//       conteggio={parseFloat(lightning.count.value)}
//       myCoords={{ lat: 38.088778, lon: 13.250223 }}
//     /> */}
//   </div>
// </main>
// </div>

const getCurrentDateTime = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return {
    day: now.toLocaleDateString("it-IT", { weekday: "long" }),
    time: now.toLocaleTimeString("it-IT", options),
  };
};

const determineUVRisk = (uvIndex: number): string => {
  if (uvIndex <= 2) return "Basso";
  if (uvIndex <= 5) return "Moderato";
  if (uvIndex <= 7) return "Alto";
  if (uvIndex <= 10) return "Molto Alto";
  return "Estremo";
};

const formatDateTime = (date: Date, start: boolean) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  if (start) {
    return `${year}-${month}-${day} 00:00:00`; // Correctly enclosed in backticks
  }
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:00`; // Correctly enclosed in backticks
};


export default Dashboard;