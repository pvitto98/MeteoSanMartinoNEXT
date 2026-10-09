import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Icon, type IconName } from "@/components/ui/Icon";
import { trackEvent } from "@/lib/analytics";
import { detectPlatform, useInstallPrompt } from "@/lib/pwa";
import styles from "./Sheets.module.css";

const BENEFITS: { icon: IconName; text: string }[] = [
  { icon: "now", text: "Si apre all'istante, a tutto schermo" },
  { icon: "offline", text: "Mostra gli ultimi dati anche offline" },
  { icon: "station", text: "La stazione di San Martino sempre in tasca" },
];

export function InstallSheet({ open, onClose, onDismiss }: { open: boolean; onClose: () => void; onDismiss: () => void }) {
  const { canPrompt, prompt } = useInstallPrompt();
  const [env, setEnv] = useState<ReturnType<typeof detectPlatform> | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) setEnv(detectPlatform());
  }, [open]);

  if (!env) return null;

  const install = async () => {
    const outcome = await prompt();
    trackEvent("pwa_install_prompt", { outcome });
    onClose();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(location.origin);
      setCopied(true);
    } catch {
      /* clipboard unavailable: the user can still use the browser menu */
    }
  };

  const showIosArrow = env.platform === "ios" && !env.iPad && !canPrompt;

  return (
    <Sheet open={open} onClose={onDismiss} label="Installa l'app">
      <div className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/badge.png" alt="" width={72} height={72} className={styles.appIcon} />
        <div>
          <h2 className={styles.title}>Porta il meteo sulla Home</h2>
          <p className={styles.subtitle}>Installa Meteo San Martino: è gratis e non occupa spazio.</p>
        </div>
      </div>

      <ul className={styles.benefits}>
        {BENEFITS.map((b) => (
          <li key={b.text}>
            <span className={styles.benefitIcon}>
              <Icon name={b.icon} size={18} />
            </span>
            {b.text}
          </li>
        ))}
      </ul>

      {canPrompt ? (
        <div className={styles.actions}>
          <button className={styles.primary} onClick={install}>
            <Icon name="download" size={18} /> Installa l&apos;app
          </button>
          <button className={styles.secondary} onClick={onDismiss}>
            Più tardi
          </button>
        </div>
      ) : env.platform === "ios" ? (
        <>
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNo}>1</span>
              <span>
                Tocca <Kbd icon="share">Condividi</Kbd> nella barra di Safari
                <small>Non lo vedi? Tocca prima <Kbd icon="dots" /></small>
              </span>
            </li>
            <li>
              <span className={styles.stepNo}>2</span>
              <span>
                Scegli <Kbd icon="plusSquare">Aggiungi alla schermata Home</Kbd>
              </span>
            </li>
            <li>
              <span className={styles.stepNo}>3</span>
              <span>
                Conferma con <strong>Aggiungi</strong>
              </span>
            </li>
          </ol>
          <div className={styles.actions}>
            <button className={styles.primary} onClick={onDismiss}>
              Ho capito
            </button>
            <button className={styles.secondary} onClick={onDismiss}>
              Più tardi
            </button>
          </div>
        </>
      ) : env.platform === "in-app" ? (
        <>
          <p className={styles.note}>
            Stai usando il browser interno di un&apos;app. Per installarla, apri questa pagina in <strong>Safari</strong> o{" "}
            <strong>Chrome</strong>: tocca <Kbd icon="dots" /> e scegli <em>Apri nel browser</em>.
          </p>
          <div className={styles.actions}>
            <button className={styles.primary} onClick={copyLink}>
              {copied ? "Link copiato ✓" : "Copia il link"}
            </button>
            <button className={styles.secondary} onClick={onDismiss}>
              Più tardi
            </button>
          </div>
        </>
      ) : (
        <>
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNo}>1</span>
              <span>
                Apri il menu del browser <Kbd icon="dots" />
              </span>
            </li>
            <li>
              <span className={styles.stepNo}>2</span>
              <span>
                Scegli <strong>Installa app</strong> o <strong>Aggiungi a schermata Home</strong>
              </span>
            </li>
          </ol>
          <div className={styles.actions}>
            <button className={styles.primary} onClick={onDismiss}>
              Ho capito
            </button>
            <button className={styles.secondary} onClick={onDismiss}>
              Più tardi
            </button>
          </div>
        </>
      )}

      {showIosArrow && open && <div className={styles.iosArrow} aria-hidden="true" />}
    </Sheet>
  );
}

function Kbd({ icon, children }: { icon: IconName; children?: React.ReactNode }) {
  return (
    <span className={styles.kbd}>
      <Icon name={icon} size={15} strokeWidth={2} />
      {children}
    </span>
  );
}
