"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/app", label: "Laboratorio", icon: "⌂" },
  { href: "/app/discover", label: "Biblioteca", icon: "✦" },
  { href: "/app/new", label: "Nueva prueba", icon: "+" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-frame lab-app-frame">
      <aside className="sidebar lab-sidebar">
        <Link href="/" className="brand"><span className="brand-mark">i</span><span>itera</span><small className="brand-edition">LABBOOK</small></Link>
        <div className="sidebar-rule"><span>PERSONAL LAB</span><span>01</span></div>
        <nav className="side-nav">
          {nav.map((item, index) => {
            const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            return <Link className={active ? "side-link active" : "side-link"} href={item.href} key={item.href}><span>{item.icon}</span><em>0{index + 1}</em>{item.label}</Link>;
          })}
        </nav>
        <div className="side-foot lab-side-foot"><span className="side-status"><i /> LOCAL MODE</span><strong>Prueba · Mide · Decide</strong><small>Tus datos viven en este navegador durante el MVP.</small></div>
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
