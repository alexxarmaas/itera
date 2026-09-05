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
    <main className="product-page">
      <header className="product-header"><div><p className="eyebrow">DESCUBRE</p><h1>¿Qué quieres probar?</h1><p>Experimentos pequeños, concretos y con una fecha de finalización.</p></div></header>
      <div className="filter-row">{categories.map((item) => <button type="button" onClick={() => setCategory(item)} className={item === category ? "filter-chip active" : "filter-chip"} key={item}>{item}</button>)}</div>
      <section className="catalog-grid">
        {filtered.map((item) => (
          <article className="catalog-card" key={item.slug}>
            <div className="catalog-top"><span className="experiment-icon large">{item.emoji}</span><span className="pill">{item.durationDays} días</span></div>
            <div><small className="category-label">{item.category}</small><h2>{item.title}</h2><p>{item.description}</p></div>
            <div className="catalog-meta"><span>{item.durationDays} días de prueba</span><span>·</span><span>Mide {item.metricLabel.toLowerCase()}</span></div>
            <button type="button" className="button button-primary full" onClick={() => start(item.slug)}>Probar este experimento</button>
          </article>
        ))}
      </section>
    </main>
  );
}
