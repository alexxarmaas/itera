"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { catalog } from "@/lib/catalog";
import { createFromTemplate } from "@/lib/storage";

const categories = ["Todos", ...Array.from(new Set(catalog.map((item) => item.category)))];

export default function DiscoverPage() {
  const router = useRouter();
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalog.filter((item) => {
      const inCategory = category === "Todos" || item.category === category;
      const searchable = `${item.title} ${item.description} ${item.category} ${item.metricLabel}`.toLowerCase();
      return inCategory && (!normalized || searchable.includes(normalized));
    });
  }, [category, query]);

  function start(slug: string) {
    const template = catalog.find((item) => item.slug === slug);
    if (!template) return;
    const experiment = createFromTemplate(template);
    router.push(`/app/experiments/${experiment.id}`);
  }

  return (
    <main className="product-page lab-discover-page">
      <div className="lab-page-index"><span>ITERA / REFERENCE LIBRARY</span><span>{catalog.length.toString().padStart(2, "0")} FICHAS</span></div>
      <header className="product-header lab-product-header"><div><p className="eyebrow">BIBLIOTECA DE PRUEBAS</p><h1>¿Qué quieres poner a prueba?</h1><p>Elige una ficha, cambia una sola cosa y registra una señal concreta durante unos días.</p></div></header>

      <div className="library-tools">
        <label className="library-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca móvil, sueño, dinero, estudio..." aria-label="Buscar experimentos" /></label>
        <span className="library-count">{filtered.length} resultado{filtered.length === 1 ? "" : "s"}</span>
      </div>

      <div className="filter-row">{categories.map((item) => <button type="button" onClick={() => setCategory(item)} className={item === category ? "filter-chip active" : "filter-chip"} key={item}>{item}</button>)}</div>

      {filtered.length ? <section className="catalog-grid">
        {filtered.map((item, index) => (
          <article className="catalog-card lab-catalog-card" key={item.slug}>
            <div className="catalog-index">REF / {(index + 1).toString().padStart(2, "0")}</div>
            <div className="catalog-top"><span className="experiment-icon large">{item.emoji}</span><span className="pill">{item.durationDays} días</span></div>
            <div><small className="category-label">{item.category}</small><h2>{item.title}</h2><p>{item.description}</p></div>
            <div className="catalog-hypothesis"><small>HIPÓTESIS</small><span>{item.hypothesis}</span></div>
            <div className="catalog-meta"><span>SEÑAL · {item.metricLabel}</span><span>{item.metricMin}—{item.metricMax}{item.metricUnit}</span></div>
            <button type="button" className="button button-accent full" onClick={() => start(item.slug)}>Probar esta ficha →</button>
          </article>
        ))}
      </section> : <div className="empty-state lab-empty"><span>⌕</span><small>SIN COINCIDENCIAS</small><h3>No encontramos esa prueba.</h3><p>Prueba con otra palabra o vuelve a mostrar todas las categorías.</p><button type="button" className="button button-secondary" onClick={() => { setCategory("Todos"); setQuery(""); }}>Limpiar filtros</button></div>}
    </main>
  );
}
