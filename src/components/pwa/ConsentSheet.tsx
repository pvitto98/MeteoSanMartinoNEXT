import Link from "next/link";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import styles from "./Sheets.module.css";

/** GDPR-friendly first-run choice: both options are equally easy, nothing loads before a "yes". */
export function ConsentSheet({ open, onChoice }: { open: boolean; onChoice: (granted: boolean) => void }) {
  return (
    <Sheet open={open} onClose={() => onChoice(false)} label="Preferenze privacy">
      <div className={styles.hero}>
        <span className={styles.shield}>
          <Icon name="shield" size={28} />
        </span>
        <div>
          <h2 className={styles.title}>Benvenuto!</h2>
          <p className={styles.subtitle}>
            Ci aiuti a migliorare l&apos;app con statistiche anonime di utilizzo (Google Analytics)? Nessuna pubblicità,
            nessun profilo.
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.primary} onClick={() => onChoice(true)}>
          Accetta statistiche
        </button>
        <button className={styles.secondaryStrong} onClick={() => onChoice(false)}>
          Solo cookie necessari
        </button>
      </div>
      <p className={styles.fineprint}>
        Puoi cambiare idea quando vuoi dalla pagina <Link href="/info">Info</Link>.
      </p>
    </Sheet>
  );
}
