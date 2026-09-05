"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/app", label: "Inicio", icon: "⌂" },
  { href: "/app/discover", label: "Descubrir", icon: "✦" },
  { href: "/app/new", label: "Nuevo", icon: "+" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link href="/" className="brand"><span className="brand-mark">i</span><span>itera</span></Link>
        <nav className="side-nav">
          {nav.map((item) => {
            const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            return <Link className={active ? "side-link active" : "side-link"} href={item.href} key={item.href}><span>{item.icon}</span>{item.label}</Link>;
          })}
        </nav>
        <div className="side-foot"><strong>Prueba · Mide · Decide</strong><small>Tus datos se guardan solo en este navegador durante el MVP.</small></div>
      </aside>
      <div className="app-content">{children}</div>
      <nav className="mobile-nav">
        {nav.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return <Link className={active ? "mobile-link active" : "mobile-link"} href={item.href} key={item.href}><span>{item.icon}</span><small>{item.label}</small></Link>;
        })}
      </nav>
    </div>
  );
}
