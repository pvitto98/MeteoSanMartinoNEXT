import type { CSSProperties, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./Card.module.css";

interface CardProps {
  title?: string;
  icon?: IconName;
  /** Small text or element on the right of the header. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Span both columns of the dashboard grid. */
  /** Span the full grid width; "mobile" spans it only below the desktop breakpoint. */
  wide?: boolean | "mobile";
  /** Position in the entrance stagger. */
  index?: number;
  as?: "section" | "article" | "div";
}

/** Frosted glass surface floating over the sky. */
export function Card({ title, icon, aside, children, className = "", wide, index = 0, as: Tag = "section" }: CardProps) {
  return (
    <Tag
      className={`${styles.card} ${wide === "mobile" ? styles.wideMobile : wide ? styles.wide : ""} reveal ${className}`}
      style={{ "--i": index } as CSSProperties}
      aria-label={title}
    >
      {title && (
        <header className={styles.header}>
          <h2 className={styles.title}>
            {icon && <Icon name={icon} size={15} strokeWidth={2} />}
            {title}
          </h2>
          {aside && <div className={styles.aside}>{aside}</div>}
        </header>
      )}
      {children}
    </Tag>
  );
}

/** Big value with a small unit, the building block of every tile. */
export function Metric({ value, unit, size = "md", className = "" }: { value: ReactNode; unit?: string; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span className={`${styles.metric} ${styles[size]} tabular ${className}`}>
      {value}
      {unit && <span className={styles.unit}>{unit}</span>}
    </span>
  );
}
