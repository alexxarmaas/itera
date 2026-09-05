import type { Metadata } from "next";
import "./globals.css";
import "./labbook.css";
import "./labbook-polish.css";
import "./ui-pass.css";
import "./method-pass.css";

export const metadata: Metadata = {
  title: "Itera — Tu laboratorio personal",
  description: "Prueba cambios pequeños, mide una señal y descubre qué te funciona de verdad.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
