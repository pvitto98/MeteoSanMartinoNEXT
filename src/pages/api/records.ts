import type { NextApiRequest, NextApiResponse } from "next";
import { getRecords } from "@/lib/server/archive";
import { cachedJson } from "@/lib/server/respond";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return cachedJson(res, getRecords, { maxAge: 3600 });
}
