import Link from "next/link";
import { useRouter } from "next/router";
import { Icon, type IconName } from "@/components/ui/Icon";
import styles from "./TabBar.module.css";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Ora", icon: "now" },
  { href: "/previsioni", label: "Previsioni", icon: "forecast" },
  { href: "/storico", label: "Storico", icon: "history" },
  { href: "/record", label: "Record", icon: "trophy" },
  { href: "/info", label: "Info", icon: "info" },
];

/** Thumb-reachable navigation, like a native app. */
export function TabBar() {
  const { pathname } = useRouter();
  return (
    <nav className={styles.bar} aria-label="Navigazione principale">
      <ul className={styles.list}>
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link href={tab.href} className={`${styles.tab} ${active ? styles.active : ""}`} aria-current={active ? "page" : undefined}>
                <Icon name={tab.icon} size={22} strokeWidth={active ? 2.2 : 1.7} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
