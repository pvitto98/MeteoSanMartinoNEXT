import React, { useEffect, useState } from 'react';
import styles from './Navbar.module.css';
import Drawer from '@/newComponents/Drawer';
import useScrollExpanded from '../hooks/useScrollExpanded';

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

export const WeatherNav: React.FC<WeatherNavProps> = ({
  locationName,
  category,
  imageUrl,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isCardExpanded = useScrollExpanded(20); // Use the custom hook

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isDrawerOpen]);

  return (
    <nav
      className={`${styles.navbar} ${isCardExpanded ? styles.expandedNav : ''}`}
      role="navigation"
      aria-label="Weather navigation"
    >
      <LocationHeader locationName={locationName} category={category} />
      <button className={styles.icsharpMenu} onClick={toggleDrawer}>
        <svg
          className={styles.menuIcon}
          width="21"
          height="21"
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.50005 6.5H16.5M4.49805 10.5H16.495M4.50005 14.5H16.495"
            stroke={isCardExpanded ? 'white' : '#757575'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isDrawerOpen && <Drawer className={styles.drawer} onClose={toggleDrawer} />}
    </nav>
  );
};
