import type { NextApiRequest, NextApiResponse } from "next";
import { getStationToday } from "@/lib/server/ecowitt";
import { cachedJson } from "@/lib/server/respond";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return cachedJson(res, getStationToday, { maxAge: 240 });
}
