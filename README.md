# Meteo San Martino delle Scale

Live weather from the Ecowitt station in San Martino delle Scale (Monreale, PA): an installable, mobile-first PWA built with Next.js (Pages Router).

- **Ora**: live readings over a sky that follows the real sun position and the measured cloudiness; today's temperature chart (measured + forecast), wind rose, rain gauge, sun path, UV, air quality, pressure trend, lightning.
- **Previsioni**: hour-by-hour and 7-day forecast from Open-Meteo, rain outlook, and station-vs-model comparison.
- **Storico**: daily archive by month or year: temperature bands, rain, calendar/heatmap, and per-day details.
- **Record**: all-time extremes, dry/wet spells, the same day in previous years, and year-by-year totals.

## Getting started

```bash
npm install
npm run dev
```

### Environment variables

| Variable | Used for |
| --- | --- |
| `ECOWITT_APPLICATION_KEY`, `ECOWITT_API_KEY` | Live station data |
| `DATABASE_URL` | MongoDB archive (Prisma) |
| `WUNDER_API_KEY` | Daily archiving job (`/api/device/daily_measuration`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics (comma-separated IDs allowed), loaded **only after consent**. Cookieless visit counts come from Vercel Web Analytics (enable it in the Vercel dashboard). |
| `ARCHIVE_SECRET` | Optional: when set, archive requests for a specific `?date=` need `Authorization: Bearer <secret>`. The plain daily call stays open for the cron job. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for meta tags |
| `DEV_UPSTREAM_URL` | Local dev only: without the secrets above, proxy station data and archive through a deployed instance (e.g. `https://meteo-san-martino-next.vercel.app`) |

## How it works

- `src/lib/server/*` normalises Ecowitt payloads to metric numbers, wraps Open-Meteo and the Prisma archive. API routes send `s-maxage` headers, so all visitors share one upstream call per window.
- `src/lib/sky.ts` derives the sky condition from the station itself: lightning → rain gauge → fog → **clear-sky index** (pyranometer reading ÷ Haurwitz clear-sky irradiance) by day → Open-Meteo cloud cover by night. It also builds the live sky palette from the sun altitude.
- `src/lib/hooks.ts` holds the SWR data hooks; components live in `src/components/{sky,now,forecast,history,ui,layout,pwa}`. Charts are hand-written SVG, with no chart library.
- PWA: `public/manifest.json` (maskable icons, shortcuts) and `public/sw.js` (network-first data with offline fallback, cache-first static assets). The install sheet (`src/components/pwa`) uses the native prompt on Chromium and illustrated steps on iOS and in in-app browsers. It runs after the privacy choice and snoozes for 7 days, at most twice.
- Weather icons are [Meteocons](https://github.com/basmilius/weather-icons) by Bas Milius (MIT, licence in `public/icons/weather/`): animated in the hero, static in lists. Preview them all in dev at `/dev/icons`, and force any condition app-wide with `?forza=<kind>` (dev only).
- The app icon source is `assets/brand/app-icon.svg`.
- `assets/social/` holds server-only files for the daily share image (`/api/generateImage`).

## Daily archive

`vercel.json` runs `/api/device/daily_measuration` every night. It archives any day missing from the last week, so a missed run heals itself. It never writes a day twice, and it never writes a day without Weather Underground data. Add `?date=YYYYMMDD` for one day, and `&dryRun=1` to preview without writing.

To fill a longer gap, preview it first, then write it:

```bash
node scripts/backfill-archive.mjs --base https://meteo-san-martino-next.vercel.app --from 20250703 --to 20251019
node scripts/backfill-archive.mjs --base https://meteo-san-martino-next.vercel.app --from 20250703 --to 20251019 --write
```

Write mode previews each day again and skips anything suspicious (rerun those days with `--force` after checking them).
