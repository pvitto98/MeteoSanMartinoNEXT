import { FunctionComponent, useState } from "react";
import Link from "next/link"; // Import Next.js Link
import styles from "./Drawer.module.css";

export type DrawerType = {
  className?: string;
  onClose?: () => void;
};

const Drawer: FunctionComponent<DrawerType> = ({ className = "", onClose }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleLogoClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300); // Reset after animation
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
        {/* Remove the <a> tag and pass href directly to Link */}
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

export default Drawer;
