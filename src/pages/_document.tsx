import { Head, Html, Main, NextScript } from "next/document";
import { SITE } from "@/lib/config";

// Applies the last known sky before first paint (if under 3 hours old), so the
// page never flashes the default colours while live data loads.
const RESTORE_SKY = `try{var s=JSON.parse(localStorage.getItem("msm.sky"));if(s&&Date.now()-s.at<108e5){var r=document.documentElement.style;r.setProperty("--sky-top",s.top);r.setProperty("--sky-bottom",s.bottom);r.setProperty("--sky-glow",s.glow)}}catch(e){}`;

export default function Document() {
  return (
    <Html lang="it">
      <Head>
        <meta name="description" content={SITE.description} />
        <meta name="theme-color" content="#1f3f86" />
        <meta name="application-name" content="Meteo San Martino" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Meteo SM" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icons/favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Meteo San Martino delle Scale" />
        <meta property="og:title" content={SITE.title} />
        <meta property="og:description" content={SITE.description} />
        <meta property="og:url" content={SITE.url} />
        <meta property="og:image" content={`${SITE.url}/icons/icon-512.png`} />
        <meta name="twitter:card" content="summary" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: RESTORE_SKY }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
