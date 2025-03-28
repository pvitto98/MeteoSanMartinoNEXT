import React from 'react';
import styles from './SharedContainer.module.css';

interface SharedContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Allow additional class names
}

const SharedContainer: React.FC<SharedContainerProps> = ({ title, children, className }) => {
  return (
    <section
      className={`${styles.sharedContainer} ${className || ''}`}
      aria-labelledby={`${title}-title`}
    >
      <div className={styles.header}>
        <h2 id={`${title}-title`} className={styles.rainfallTitle}>
          {title}
        </h2>
        <hr className={styles.separator} />
      </div>
      {children}
    </section>
  );
};

export default SharedContainer;
