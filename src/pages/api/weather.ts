import type { NextApiRequest, NextApiResponse } from "next";
import { getDays } from "@/lib/server/archive";
import { cachedJson } from "@/lib/server/respond";

/** Daily archive for a year, optionally narrowed to one month. */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const year = parseInt(String(req.query.year), 10);
  const month = req.query.month ? parseInt(String(req.query.month), 10) : undefined;
  if (!Number.isInteger(year) || (month !== undefined && !(month >= 1 && month <= 12))) {
    return res.status(400).json({ error: "Invalid year or month" });
  }
  return cachedJson(res, async () => ({ weatherData: await getDays(year, month) }), { maxAge: 1800 });
}
