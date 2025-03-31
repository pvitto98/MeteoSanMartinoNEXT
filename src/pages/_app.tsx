// pages/_app.tsx

import { useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import type { AppProps } from "next/app";
import { Rubik } from "next/font/google";
import "../global.css";
import styles from "./app.module.css";
import { WeatherNav } from "@/newComponents/Navbar";
import ConsentBanner from "@/newComponents/ConsentBanner";
import * as gtag from "../lib/gtag";
import Head from "next/head";
import '../styles/globals.css';

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Send a pageview when the route changes
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  // Pass query parameters as props
  const combinedProps = { ...pageProps, query: router.query };

  return (
    <div className={`${styles.weatherPage} ${rubik.className}`}>
      <Head>
        <title>San Martino Weather</title>
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link rel="manifest" href="/manifest.json" />
      </Head>
      {/* Load the Google Analytics script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_MEASUREMENT_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      <WeatherNav
        locationName="San Martino delle Scale"
        category="Meteo"
        imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/613fc0f38cc1a9c6d440dc25d81e8baf0e4433215d6c5283a7e7f2b29814e45a?placeholderIfAbsent=true&apiKey=e62f62da33e24992bb1b86d3f077b794"
      />

      <Component {...combinedProps} />
      <ConsentBanner />
    </div>
  );
}
