"use client";
import React, { useState } from "react";

export interface WeatherDataPoint {
    day: string;
    high: number;
    low: number;
  }
  
  export interface TemperatureLineProps {
    data: WeatherDataPoint[];
    color: string;
    type: 'high' | 'low';
  }
  
  export interface TemperaturePointProps {
    data: WeatherDataPoint[];
    color: string;
    type: 'high' | 'low';
  }

  const TemperaturePoints: React.FC<TemperaturePointProps> = ({ data, color, type }) => {
    return (
      <>
        {data.map((point, index) => (
          <circle
            key={`${point.day}-${type}`}
            r="4"
            fill={color}
            cx={20 + index * 43}
            cy={90 - (point[type] + 10) * 3}
            role="graphics-symbol"
            aria-label={`${point.day} ${type} temperature: ${point[type]}°`}
          />
        ))}
      </>
    );
  };

const TemperatureLine: React.FC<TemperatureLineProps> = ({ data, color, type }) => {
  const getPath = () => {
    return `M 20,${90 - (data[0][type] + 10) * 3} ` +
      data.map((point, i) => `L ${20 + i * 43},${90 - (point[type] + 10) * 3}`).join(" ");
  };




  return (
    <path
      stroke={color}
      strokeWidth="2"
      fill="none"
      className="relative"
      d={getPath()}
      role="graphics-symbol"
      aria-label={`Temperature ${type} line graph`}
    />
  );
};

export const WeatherForecast: React.FC = () => {
  const [weatherData] = useState<WeatherDataPoint[]>(() => [
    { day: "Mon", high: 10, low: 20},
    { day: "Tue", high: 10, low: 0 },
    { day: "Wed", high: 7, low: -3 },
    { day: "Thu", high: 5, low: -5 },
    { day: "Fri", high: 6, low: -4 },
    { day: "Sat", high: 9, low: -1 },
    { day: "Sun", high: 11, low: 1 },
  ]);

  return (
    <section 
      className="flex overflow-hidden flex-col justify-center items-center py-5 text-black rounded-2xl bg-purple-300 bg-opacity-30 max-w-[380px]"
      role="region"
      aria-label="Weather forecast"
    >
      <div className="flex flex-col items-center">
        <header className="flex gap-2.5 items-center text-sm tracking-normal leading-6">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/073cf60b089785eda2a360656475b481822e0264caa97359bb76f938893f7441?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794"
            alt=""
            className="object-contain shrink-0 self-stretch my-auto aspect-[0.96] w-[27px]"
          />
          <h1 className="self-stretch my-auto w-[79px]">Day forecast</h1>
        </header>
        
        <div className="flex flex-col items-center mt-2.5 whitespace-nowrap">
          <div className="flex gap-1.5 justify-center items-start text-base leading-7">
            <div className="flex flex-col w-7" role="presentation">
              <div>10°</div>
              <div className="mt-4">0°</div>
              <div className="mt-4">-10°</div>
            </div>
            
            <div 
              className="flex relative flex-col p-2.5 rounded-lg bg-white bg-opacity-10 min-w-[240px] w-[302px]"
              role="img"
              aria-label="Temperature graph"
            >
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/561b10c1db8717c28732cb2e7400a27ff2719822a3f8f73da7e295d9d146aa50?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794"
                alt=""
                className="object-contain absolute inset-0 size-full"
              />
              <TemperatureLine data={weatherData} color="#FF6B6B" type="high" />
              <TemperatureLine data={weatherData} color="#4ECDC4" type="low" />
              <TemperaturePoints data={weatherData} color="#FF6B6B" type="high" />
              <TemperaturePoints data={weatherData} color="#4ECDC4" type="low" />
            </div>
          </div>
          
          <div className="flex gap-5 items-center mt-2.5 text-base tracking-normal leading-none">
            {weatherData.map((data) => (
              <div key={data.day} className="self-stretch my-auto w-[34px]">
                {data.day}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
