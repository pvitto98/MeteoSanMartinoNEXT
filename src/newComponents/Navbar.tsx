import React, { useEffect, useState } from 'react';
import styles from './Navbar.module.css';
import Drawer from '@/newComponents/Drawer';

export interface LocationHeaderProps {
  locationName: string;
  category: string;
}

export interface WeatherNavProps {
  locationName: string;
  category: string;
  imageUrl: string;
}

const LocationHeader: React.FC<LocationHeaderProps> = ({ locationName, category }) => {
  return (
    <div className={styles.header}>
      <span className={styles.category}>{category}</span>
      <h1 className={styles.locationName}>{locationName}</h1>
    </div>
  );
};

export const WeatherNav: React.FC<WeatherNavProps> = ({ locationName, category, imageUrl }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling when drawer is open
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling when drawer is closed
    }
  }, [isDrawerOpen]);

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`} role="navigation" aria-label="Weather navigation">
      <LocationHeader
        locationName={locationName}
        category={category}
      />

      <button className={styles.icsharpMenu} onClick={toggleDrawer}>
        <img
          loading="lazy"
          src={imageUrl}
          className={styles.locationImage}
          alt={`Weather conditions for ${locationName}`}
        />
</button>
      {/* Only render the Drawer component when it's open */}
      {isDrawerOpen && <Drawer className={styles.drawer} onClose={toggleDrawer} />}
    </nav>
  );
};