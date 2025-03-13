import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { start_date, end_date } = req.query;

  try {
    // Build the Ecowitt API URL with required parameters
    const ecowittUrl = `https://api.ecowitt.net/api/v3/device/history`;

    

    const response = await axios.get(ecowittUrl, {
      params: {
        application_key: process.env.ECOWITT_APPLICATION_KEY, // Environment variable
        api_key: process.env.ECOWITT_API_KEY, // Environment variable
        mac: "54:32:04:43:1E:24", // Example MAC address
        temp_unitid: 1, // Temperature unit ID
        start_date,
        end_date,
        call_back: "outdoor.temperature,outdoor.feels_like,outdoor.dew_point,lightning.distance,wind.wind_speed,wind.wind_direction,solar_and_uvi",
        cycle_type: "auto",
      },
    });


    // Return Ecowitt API response to the client
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching device history:", error);
    res.status(500).json({ error: "Failed to fetch device history" });
  }
}
