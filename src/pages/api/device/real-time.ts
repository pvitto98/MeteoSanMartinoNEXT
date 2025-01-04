import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.get("https://api.ecowitt.net/api/v3/device/real_time", {
      params: {
        application_key: process.env.ECOWITT_APPLICATION_KEY, // Stored in .env.local
        api_key: process.env.ECOWITT_API_KEY, // Stored in .env.local
        mac: "54:32:04:43:1E:24",
        temp_unitid: 1,
        rainfall_unitid: 12,
        pressure_unitid: 3,
        wind_speed_unitid: 7,
        call_back: "all",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching real-time data:", error);
    res.status(500).json({ error: "Failed to fetch real-time data" });
  }
}
