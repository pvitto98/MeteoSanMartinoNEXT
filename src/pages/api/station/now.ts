import type { NextApiRequest, NextApiResponse } from "next";
import { getStationNow } from "@/lib/server/ecowitt";
import { cachedJson } from "@/lib/server/respond";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return cachedJson(res, getStationNow, { maxAge: 50 });
}
