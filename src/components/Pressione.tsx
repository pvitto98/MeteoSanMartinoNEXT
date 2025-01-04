import { FunctionComponent } from "react";
import styles from "./Pressione.module.css";

export type PressioneProps = {
  pressione: number;
  className?: string;
};

const Pressione: FunctionComponent<PressioneProps> = ({
  pressione,
  className = "",
}) => {
  return (
    <div className={[styles.pressureDetails, className].join(" ")}>
      <b className={styles.pressioneLabel}>Pressione</b>
      <b className={styles.hpa}>{pressione} hPa</b>
    </div>
  );
};

export default Pressione;
