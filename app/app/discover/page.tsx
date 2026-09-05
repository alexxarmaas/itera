"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { catalog } from "@/lib/catalog";
import { createFromTemplate } from "@/lib/storage";

const categories = ["Todos", ...Array.from(new Set(catalog.map((item) => item.category)))];

export default function DiscoverPage() {
  const router = useRouter();
  const [category, setCategory] = useState("Todos");
  const filtered = category === "Todos" ? catalog : catalog.filter((item) => item.category === category);

  function start(slug: string) {
    const template = catalog.find((item) => item.slug === slug);
    if (!template) return;
    const experiment = createFromTemplate(template);
    router.push(`/app/experiments/${experiment.id}`);
  }

  return (
    <main className="product-page lab-library">
      <div className="lab-page-index"><span>REFERENCE LIBRARY</span><span>{String(catalog.length).padStart(2, "0")} FICHAS</span></div>
      <header className="product-header lab-product-header"><div><p className="eyebrow">BIBLIOTECA DE PRUEBAS</p><h1>¿Qué quieres comprobar?</h1><p>Protocolos pequeños para preguntas cotidianas. Elige uno, adáptalo y genera tus propios datos.</p></div></header>
      <div className="filter-row lab-filters">{categories.map((item) => <button type="button" onClick={() => setCategory(item)} className={item === category ? "filter-chip active" : "filter-chip"} key={item}>{item}</button>)}</div>
      <section className="catalog-grid">
        {filtered.map((item, index) => (
          <article className="catalog-card lab-catalog-card" key={item.slug}>
            <div className="catalog-index">REF / {String(index + 1).padStart(2, "0")}</div>
            <div className="catalog-top"><span className="experiment-icon large">{item.emoji}</span><span className="pill">{item.durationDays} DÍAS</span></div>
            <div><small className="category-label">{item.category}</small><h2>{item.title}</h2><p>{item.description}</p></div>
            <div className="catalog-protocol"><div><small>HIPÓTESIS</small><span>{item.hypothesis}</span></div><div><small>SEÑAL</small><strong>{item.metricLabel}</strong></div></div>
            <button type="button" className="button button-accent full" onClick={() => start(item.slug)}>Abrir esta ficha →</button>
          </article>
        ))}
      </section>
    </main>
  );
}
