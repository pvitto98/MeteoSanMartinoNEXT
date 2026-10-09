import type { NextApiRequest, NextApiResponse } from "next";
import { getYears } from "@/lib/server/archive";
import { cachedJson } from "@/lib/server/respond";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return cachedJson(
    res,
    async () => ({
      years: (await getYears()).map(String),
      months: Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")),
    }),
    { maxAge: 3600 },
  );
}
