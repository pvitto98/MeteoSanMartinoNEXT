import { useEffect } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { Rubik } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/globals.css";
// Imported for its side effect: capture `beforeinstallprompt` as early as possible.
import { registerServiceWorker } from "@/lib/pwa";
import { SITE } from "@/lib/config";
import { SkyBackground } from "@/components/sky/SkyBackground";
import { TopBar } from "@/components/layout/TopBar";
import { TabBar } from "@/components/layout/TabBar";
import { FirstRun } from "@/components/pwa/FirstRun";

const rubik = Rubik({ subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap" });

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();

  useEffect(() => registerServiceWorker(), []);

  return (
    <>
      <Head>
        <title>{SITE.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <style jsx global>{`
        :root {
          --font-sans: ${rubik.style.fontFamily};
        }
      `}</style>
      <SkyBackground />
      <TopBar />
      <main key={pathname} className="page">
        <Component {...pageProps} />
      </main>
      <TabBar />
      <FirstRun />
      {/* Cookieless visit counting: works for every visitor, no consent needed. */}
      <Analytics />
    </>
  );
}
