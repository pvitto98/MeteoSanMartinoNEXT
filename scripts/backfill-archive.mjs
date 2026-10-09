#!/usr/bin/env node
/**
 * Fills gaps in the daily archive through /api/device/daily_measuration.
 *
 *   node scripts/backfill-archive.mjs --base <url> --from 20250703 --to 20251019          # dry run: preview only
 *   node scripts/backfill-archive.mjs --base <url> --from 20250703 --to 20251019 --write  # write after reviewing
 *
 * In write mode every day is previewed first and skipped if anything looks off
 * (see `warnings`), unless --force is given.
 *
 * Days already in the archive are skipped by the endpoint, days without
 * Weather Underground data are reported and never written. Set ARCHIVE_SECRET
 * in the environment if the deployment requires it.
 */
import { writeFileSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : true]);
    return acc;
  }, []),
);
const { base, from, to } = args;
const write = args.write === true;
const force = args.force === true;
if (!base || !/^\d{8}$/.test(from ?? "") || !/^\d{8}$/.test(to ?? "")) {
  console.error("Usage: --base <url> --from YYYYMMDD --to YYYYMMDD [--write]");
  process.exit(1);
}

const toDate = (s) => new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)));
const fmt = (d) => d.toISOString().slice(0, 10).replaceAll("-", "");
const dates = [];
for (let d = toDate(from); d <= toDate(to); d = new Date(d.getTime() + 86_400_000)) dates.push(fmt(d));
if (dates.length > 400) throw new Error("Refusing to process more than 400 days at once");

const headers = process.env.ARCHIVE_SECRET ? { Authorization: `Bearer ${process.env.ARCHIVE_SECRET}` } : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Flags values that deserve a human look before writing. */
function warnings(r) {
  const w = [];
  if (r.tempHigh - r.tempLow < 1.5) w.push("tiny temperature range");
  if (r.tempHigh - r.tempLow > 25) w.push("huge temperature range");
  if (r.precipTotal > 150) w.push("rain > 150 mm");
  if (r.pressureMax && (r.pressureMax > 1050 || r.pressureMin < 960)) w.push("pressure out of range");
  if (r.windgustHigh > 150) w.push("gust > 150 km/h");
  return w;
}

console.log(`${write ? "WRITING" : "DRY RUN"} ${dates.length} days on ${base}\n`);
const report = [];
async function call(date, dryRun) {
  const url = new URL("/api/device/daily_measuration", base);
  url.searchParams.set("date", date);
  if (dryRun) url.searchParams.set("dryRun", "1");
  try {
    const res = await fetch(url, { headers });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
    return json.results[0];
  } catch (e) {
    return { date, status: "error", reason: e.message };
  }
}

for (const date of dates) {
  let outcome = await call(date, true);
  let w = outcome.record ? warnings(outcome.record) : [];
  if (write && outcome.status === "preview") {
    if (w.length && !force) {
      outcome = { ...outcome, status: "skipped", reason: "warnings: review it, then rerun this day with --force" };
    } else {
      await sleep(2500);
      outcome = await call(date, false);
      w = outcome.record ? warnings(outcome.record) : w;
    }
  }
  const r = outcome.record;
  report.push({ ...outcome, warnings: w });
  console.log(
    date,
    outcome.status.padEnd(8),
    r && outcome.status !== "skipped"
      ? `T ${r.tempLow}…${r.tempHigh}°  rain ${r.precipTotal} mm  RH ${r.humidityAvg}%  gust ${r.windgustHigh}  ⚡ ${r.lightningCount}`
      : outcome.reason ?? "",
    w.length ? `  ⚠️  ${w.join(", ")}` : "",
  );
  // Weather Underground allows ~30 calls per minute.
  await sleep(2500);
}

const file = `backfill-${write ? "written" : "preview"}-${from}-${to}.json`;
writeFileSync(file, JSON.stringify(report, null, 2));
const count = (s) => report.filter((r) => r.status === s).length;
console.log(
  `\n${count(write ? "written" : "preview")} ${write ? "written" : "ready"}, ${count("exists")} already present, ${count("no-data")} without data, ${count("skipped")} skipped, ${count("error")} errors, ${report.filter((r) => r.warnings.length).length} with warnings → ${file}`,
);
