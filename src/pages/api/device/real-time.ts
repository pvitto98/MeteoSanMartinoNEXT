import type { NextApiRequest, NextApiResponse } from "next";
import { STATION } from "@/lib/config";

/** Raw Ecowitt real-time payload (kept for external consumers and local dev proxying). */
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = new URL("https://api.ecowitt.net/api/v3/device/real_time");
    url.search = new URLSearchParams({
      application_key: process.env.ECOWITT_APPLICATION_KEY ?? "",
      api_key: process.env.ECOWITT_API_KEY ?? "",
      mac: STATION.ecowittMac,
      temp_unitid: "1",
      rainfall_unitid: "12",
      pressure_unitid: "3",
      wind_speed_unitid: "7",
      call_back: "all",
    }).toString();
    const response = await fetch(url, { cache: "no-store" });
    res.setHeader("Cache-Control", "public, s-maxage=50, stale-while-revalidate=300");
    res.status(200).json(await response.json());
  } catch (error) {
    console.error("Error fetching real-time data:", error);
    res.status(500).json({ error: "Failed to fetch real-time data" });
  }
}
