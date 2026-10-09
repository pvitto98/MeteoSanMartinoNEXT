import type { NextApiRequest, NextApiResponse } from "next";
import { getForecast } from "@/lib/server/forecast";
import { cachedJson } from "@/lib/server/respond";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return cachedJson(res, getForecast, { maxAge: 900 });
}
