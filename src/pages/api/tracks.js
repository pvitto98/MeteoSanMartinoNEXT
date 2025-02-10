import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA_API_SECRET;
  let clientId = req.cookies._ga;

  if (!clientId) {
    clientId = uuidv4();
    const isProd = process.env.NODE_ENV === "production";
    res.setHeader(
      'Set-Cookie',
      `_ga=${clientId}; Path=/; HttpOnly; ${isProd ? 'Secure; ' : ''}SameSite=Strict`
    );
  }

  if (!measurementId || !apiSecret) {
    return res.status(500).json({ error: "Missing GA credentials" });
  }

  // Forward the client's user-agent header to GA
  const userAgent = req.headers["user-agent"] || "";

  const response = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id: clientId,
        events: [{ name: "page_view", params: { page_location: url } }],
      }),
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": userAgent
      },
    }
  );

  return res.status(200).json({ success: true });
}
