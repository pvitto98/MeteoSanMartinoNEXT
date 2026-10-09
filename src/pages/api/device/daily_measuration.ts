import type { NextApiRequest, NextApiResponse } from "next";
import { archiveDay, isArchiveDate, missingRecentDays, type ArchiveOutcome } from "@/lib/server/dailyArchive";

export const config = { maxDuration: 60 };

/**
 * Daily archiving job.
 *
 *   GET /api/device/daily_measuration                 → archive every missing day of the last week (self-healing cron)
 *   GET /api/device/daily_measuration?date=YYYYMMDD   → archive one day
 *   …&dryRun=1                                        → compute and return the record without writing
 *
 * Existing days are never written twice, so the plain call (what the external
 * daily cron job pings) is safe to repeat and never needs credentials. Requests
 * for a specific date require `Authorization: Bearer <ARCHIVE_SECRET>` when
 * that variable is set.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only GET runs the job: HEAD/OPTIONS probes must never write anything.
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const dryRun = req.query.dryRun === "1" || req.query.dryRun === "true";
  const date = typeof req.query.date === "string" ? req.query.date : undefined;

  const secret = process.env.ARCHIVE_SECRET;
  if (date !== undefined && secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (date !== undefined && !isArchiveDate(date)) {
    return res.status(400).json({ error: "Invalid date format. Expected YYYYMMDD." });
  }

  try {
    const dates = date ? [date] : await missingRecentDays(7);
    const results: ArchiveOutcome[] = [];
    // Sequential on purpose: gentle on the upstream APIs and no concurrent writes.
    for (const d of dates) results.push(await archiveDay(d, { dryRun }));
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ dryRun, results });
  } catch (error) {
    console.error("Daily archive failed:", error);
    return res.status(500).json({ error: "Daily archive failed, see server logs" });
  }
}
