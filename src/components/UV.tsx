import { FunctionComponent } from "react";
import styles from "./UV.module.css";

export type UVProps = {
  uvValue: number;
  radiationValue: number;
};

const UV: FunctionComponent<UVProps> = ({ uvValue, radiationValue }) => {
  return (
    <div className={styles.uvContainer}>
      <b className={styles.uvTitle}>UV | LUMINOSITÀ | RADIAZIONE</b>
      <img
        className={styles.uvIcon}
        loading="lazy"
        alt="UV Icon"
        src="/vector-1.svg"
      />
      <div className={styles.uvDetails}>
        <div className={styles.uvValue}>
          <b className={styles.label}>UV</b>
          <b className={styles.value}>{uvValue}</b>
        </div>
        <div className={styles.radiationValue}>
          <b className={styles.label}>RADIAZIONE</b>
          <b className={styles.value}>{radiationValue} W/m²</b>
        </div>
      </div>
    </div>
  );
};

export default UV;
