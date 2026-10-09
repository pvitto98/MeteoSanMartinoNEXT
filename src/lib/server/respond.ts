import type { NextApiResponse } from "next";

/**
 * Sends JSON with CDN caching so every visitor shares one upstream call per
 * `maxAge` window, and serves stale data while revalidating in the background.
 */
export async function cachedJson<T>(
  res: NextApiResponse,
  load: () => Promise<T>,
  { maxAge, staleWhileRevalidate = maxAge * 10 }: { maxAge: number; staleWhileRevalidate?: number },
) {
  try {
    const data = await load();
    res.setHeader("Cache-Control", `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ error: error instanceof Error ? error.message : "Upstream error" });
  }
}
