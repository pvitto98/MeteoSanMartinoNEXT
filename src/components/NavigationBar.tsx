import { FunctionComponent, useState, useEffect } from "react";
import Drawer from "./Drawer";
import styles from "./NavigationBar.module.css";
import Link from "next/link";  // Import next/link for routing

export type NavigationBar1Type = {
  className?: string;
};

const NavigationBar: FunctionComponent<NavigationBar1Type> = ({
  className = "",
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300); // Reset after animation
  };

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling when drawer is open
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling when drawer is closed
    }
  }, [isDrawerOpen]);

  return (
    <div className={[styles.navigationbar, className].join(" ")}>
      {/* Replace react-router-dom Link with next/link */}
      <Link href="/" className={styles.logo} onClick={handleClick}>
        <img
          className={`${styles.logoStyle} ${isClicked ? styles.clicked : ""}`}
          src="/icons/Logo.svg"
          alt="Logo"
        />
      </Link>

      <div className={styles.navigation}>
        <div className={styles.links}>
          <Link href="/" className={`nav-link-ltr ${styles.dashboard}`}>
            Dashboard
          </Link>
          <Link href="/storico" className={`nav-link-ltr ${styles.storico}`}>
            Storico
          </Link>
        </div>
      </div>

      <button className={styles.icsharpMenu} onClick={toggleDrawer}>
        <img className={styles.vectorIcon} alt="Menu" src="/icons/vector.svg" />
      </button>

      {/* Only render the Drawer component when it's open */}
      {isDrawerOpen && <Drawer className={styles.drawer} onClose={toggleDrawer} />}
    </div>
  );
};

export default NavigationBar;
