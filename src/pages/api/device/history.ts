import type { NextApiRequest, NextApiResponse } from "next";
import { STATION } from "@/lib/config";

const DEFAULT_CALL_BACK =
  "outdoor.temperature,outdoor.feels_like,outdoor.dew_point,lightning.distance,wind.wind_speed,wind.wind_direction,solar_and_uvi";
const PASSTHROUGH = ["call_back", "cycle_type", "temp_unitid", "rainfall_unitid", "pressure_unitid", "wind_speed_unitid"];

/** Raw Ecowitt history payload (kept for external consumers and local dev proxying). */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { start_date, end_date } = req.query;
  if (typeof start_date !== "string" || typeof end_date !== "string") {
    return res.status(400).json({ error: "start_date and end_date are required" });
  }

  try {
    const params = new URLSearchParams({
      application_key: process.env.ECOWITT_APPLICATION_KEY ?? "",
      api_key: process.env.ECOWITT_API_KEY ?? "",
      mac: STATION.ecowittMac,
      temp_unitid: "1",
      start_date,
      end_date,
      call_back: DEFAULT_CALL_BACK,
      cycle_type: "auto",
    });
    for (const key of PASSTHROUGH) {
      const value = req.query[key];
      if (typeof value === "string") params.set(key, value);
    }
    const response = await fetch(`https://api.ecowitt.net/api/v3/device/history?${params}`, { cache: "no-store" });
    res.setHeader("Cache-Control", "public, s-maxage=240, stale-while-revalidate=1200");
    res.status(200).json(await response.json());
  } catch (error) {
    console.error("Error fetching device history:", error);
    res.status(500).json({ error: "Failed to fetch device history" });
  }
}
