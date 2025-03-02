import { FunctionComponent, useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Drawer.module.css";

export type DrawerType = {
  className?: string;
  onClose?: () => void;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Drawer: FunctionComponent<DrawerType> = ({ className = "", onClose }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as BeforeInstallPromptEvent);
      setShowInstall(true);
    };
    

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      console.log("beforeinstallprompt fired!"); // ✅ Debugging
    });
  }, []);
  

  const handleInstallClick = async () => {
    console.log("Install button clicked"); // ✅ Debugging
    console.log(deferredPrompt); // ✅ Debugging
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      }
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };
  
  const handleLogoClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  return (
    <div className={[styles.drawer, className].join(" ")} data-animate-on-scroll>
      <div className={styles.logo} onClick={handleLogoClick}>
        <img
          className={`${styles.logoStyle} ${isClicked ? styles.clicked : ""}`}
          src="/logo.png"
          alt="PVITTO Logo"
        />
      </div>
      <div className={styles.links}>
        <Link href="/" className={styles.pvitto} onClick={onClose}>
          Dashboard
        </Link>
        <Link href="/storico" className={styles.projects} onClick={onClose}>
          Storico
        </Link>
        <Link href="/info" className={styles.projects} onClick={onClose}>
          Info
        </Link>

      </div>
      {onClose && (
        <button onClick={onClose} className={styles.closeButton}>
          <img src="/ic_baseline-close.svg" alt="Close" />
        </button>
      )}
    </div>
  );
};

// {showInstall && (
//   <button className={styles.installButton} onClick={handleInstallClick}>
//     ➕ Add to Home Screen
//   </button>
// )}

export default Drawer;
