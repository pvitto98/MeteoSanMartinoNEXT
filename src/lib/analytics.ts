// The previous version reported to two GA4 properties: the one from the env var
// and this hard-coded one. Keep both so neither report breaks.
const LEGACY_GA_ID = "G-ZT70ELG7BQ";
const GA_IDS = [...new Set([...(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").split(","), LEGACY_GA_ID])]
  .map((id) => id.trim())
  .filter(Boolean);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loaded = false;

/** Loads Google Analytics only after the visitor has opted in (GDPR). */
export function enableAnalytics() {
  if (loaded || !GA_IDS.length || typeof window === "undefined") return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js requires the `arguments` object itself.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  // Client-side navigations are tracked by GA4's enhanced measurement (history
  // changes), so we never send page_view manually: that used to double count.
  for (const id of GA_IDS) window.gtag("config", id);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_IDS[0]}`;
  document.head.appendChild(script);
}

/** Removes GA cookies when consent is withdrawn. */
export function disableAnalytics() {
  if (typeof document === "undefined") return;
  const domain = location.hostname.split(".").slice(-2).join(".");
  for (const c of document.cookie.split("; ")) {
    const name = c.split("=")[0];
    if (name.startsWith("_ga")) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
    }
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!loaded) return;
  window.gtag?.("event", name, params);
}
