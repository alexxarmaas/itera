import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Itera — Prueba. Mide. Decide.",
  description: "Pequeños experimentos personales para descubrir qué te funciona de verdad.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
