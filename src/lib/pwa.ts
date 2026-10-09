import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/* ───────────────── Install prompt capture ─────────────────
 * Chrome fires `beforeinstallprompt` once, possibly before React mounts,
 * so we capture it at module load (this file is imported by _app).
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferredPrompt = null;
    emit();
  });
}

export type Platform = "ios" | "android" | "in-app" | "desktop";

export function detectPlatform() {
  const ua = navigator.userAgent;
  const android = /Android/.test(ua);
  // iPadOS reports itself as a Mac: tell them apart by touch support.
  const iOS = !android && (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1));
  const inApp = /FBAN|FBAV|Instagram|Line\/|TikTok|Snapchat|LinkedInApp|GSA\//.test(ua);
  const androidChrome = android && /Chrome\//.test(ua) && !/SamsungBrowser|Firefox|OPR|EdgA/.test(ua);
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const platform: Platform = inApp ? "in-app" : iOS ? "ios" : android ? "android" : "desktop";
  return { platform, standalone, androidChrome, iPad: iOS && !/iPhone|iPod/.test(ua) };
}

export function useInstallPrompt() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  return {
    canPrompt: deferredPrompt !== null,
    installed,
    async prompt() {
      if (!deferredPrompt) return "unavailable" as const;
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      emit();
      return outcome;
    },
  };
}

/* ───────────────── Persisted preferences ───────────────── */

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or storage disabled: the prompt simply shows again next time */
  }
}

const INSTALL_KEY = "msm.install";
const SNOOZE_DAYS = 7;
const MAX_DISMISSALS = 2;

export function shouldOfferInstall() {
  const state = read(INSTALL_KEY, { dismissals: 0, snoozeUntil: 0 });
  return state.dismissals < MAX_DISMISSALS && Date.now() > state.snoozeUntil;
}

export function snoozeInstall() {
  const state = read(INSTALL_KEY, { dismissals: 0, snoozeUntil: 0 });
  write(INSTALL_KEY, { dismissals: state.dismissals + 1, snoozeUntil: Date.now() + SNOOZE_DAYS * 86_400_000 });
}

export type Consent = "granted" | "denied";
const CONSENT_KEY = "msm.consent";

export const getConsent = () => read<Consent | null>(CONSENT_KEY, null);
export const setConsent = (c: Consent) => {
  write(CONSENT_KEY, c);
  window.dispatchEvent(new Event("msm:consent-changed"));
};

/** Lets any page reopen the sheets (e.g. the Info page buttons). */
export const openInstallSheet = () => window.dispatchEvent(new Event("msm:install"));
export const openConsentSheet = () => window.dispatchEvent(new Event("msm:consent"));

export function registerServiceWorker() {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
  const register = () =>
    navigator.serviceWorker.register("/sw.js").catch((err) => console.warn("SW registration failed", err));
  // React effects usually run after `load` has already fired.
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
