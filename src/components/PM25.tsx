import { FunctionComponent } from "react";
import styles from "./PM25.module.css";

export type PM25Props = {
  aqiValue: number;
  pm25Value: number;
};

const PM25: FunctionComponent<PM25Props> = ({ aqiValue, pm25Value }) => {
  return (
    <div className={styles.pm25Container}>
      <b className={styles.pm25Title}>PM 2.5</b>
      <img
        className={styles.pm25Icon}
        loading="lazy"
        alt="PM2.5 Icon"
        src="/cbipm.svg"
      />
      <div className={styles.pm25Details}>
        <div className={styles.aqiValue}>
          <b className={styles.label}>Valore</b>
          <b className={styles.value}>{aqiValue} AQI</b>
        </div>
        <div className={styles.pm25Value}>
          <b className={styles.label}>PM2.5</b>
          <b className={styles.value}>{pm25Value}</b>
        </div>
      </div>
    </div>
  );
};

export default PM25;
