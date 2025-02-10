"use client"; // Ensures this runs in the browser

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PageTracker() {
  const router = useRouter();

  useEffect(() => {
    if (!router.asPath) return;

    fetch("/api/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: router.asPath }),
    });
  }, [router.asPath]);

  return null; // This component does not render anything
}
