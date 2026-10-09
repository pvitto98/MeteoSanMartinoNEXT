import { useCallback, useEffect, useState } from "react";
import { disableAnalytics, enableAnalytics } from "@/lib/analytics";
import { detectPlatform, getConsent, setConsent, shouldOfferInstall, snoozeInstall, useInstallPrompt } from "@/lib/pwa";
import { ConsentSheet } from "./ConsentSheet";
import { InstallSheet } from "./InstallSheet";

const INSTALL_DELAY_MS = 2500;
// Chrome may fire beforeinstallprompt a few seconds after load.
const PROMPT_GRACE_MS = 4000;

/**
 * Orchestrates the first-run moments so they never stack:
 * privacy choice first, then (if the app isn't installed) the install sheet.
 */
export function FirstRun() {
  const { canPrompt } = useInstallPrompt();
  const [sheet, setSheet] = useState<"consent" | "install" | null>(null);
  const [consentDone, setConsentDone] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (consent === "granted") enableAnalytics();
    if (consent) setConsentDone(true);
    else setSheet("consent");

    const openInstall = () => setSheet("install");
    const openConsent = () => setSheet("consent");
    window.addEventListener("msm:install", openInstall);
    window.addEventListener("msm:consent", openConsent);
    return () => {
      window.removeEventListener("msm:install", openInstall);
      window.removeEventListener("msm:consent", openConsent);
    };
  }, []);

  // Offer installation once the privacy choice is out of the way.
  useEffect(() => {
    if (!consentDone || sheet) return;
    const env = detectPlatform();
    if (env.standalone || !shouldOfferInstall()) return;

    const manualGuide = env.platform === "ios" || env.platform === "in-app" || (env.platform === "android" && !env.androidChrome);
    const delay = canPrompt || manualGuide ? INSTALL_DELAY_MS : PROMPT_GRACE_MS;
    const id = setTimeout(() => {
      // Desktop and Chrome Android only get the sheet when the browser can actually install.
      if (canPrompt || manualGuide) setSheet("install");
    }, delay);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consentDone, canPrompt]);

  const onConsent = useCallback((granted: boolean) => {
    setConsent(granted ? "granted" : "denied");
    if (granted) enableAnalytics();
    else disableAnalytics();
    setSheet(null);
    setConsentDone(true);
  }, []);

  return (
    <>
      <ConsentSheet open={sheet === "consent"} onChoice={onConsent} />
      <InstallSheet
        open={sheet === "install"}
        onClose={() => setSheet(null)}
        onDismiss={() => {
          snoozeInstall();
          setSheet(null);
        }}
      />
    </>
  );
}
