"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { catalog } from "@/lib/catalog";
import { createFromTemplate } from "@/lib/storage";
import { loadFavorites, toggleFavorite } from "@/lib/preferences";

const categories = ["Todos", ...Array.from(new Set(catalog.map((item) => item.category)))];

export default function DiscoverPage() {
  const router = useRouter();
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => setFavorites(loadFavorites()), []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalog.filter((item) => {
      const inCategory = category === "Todos" || item.category === category;
      const searchable = `${item.title} ${item.description} ${item.category} ${item.metricLabel} ${item.hypothesis}`.toLowerCase();
      const favoriteMatch = !favoritesOnly || favorites.includes(item.slug);
      return inCategory && favoriteMatch && (!normalized || searchable.includes(normalized));
    });
  }, [category, query, favoritesOnly, favorites]);

  function start(slug: string) {
    const template = catalog.find((item) => item.slug === slug);
    if (!template) return;
    const experiment = createFromTemplate(template);
    router.push(`/app/experiments/${experiment.id}`);
  }

  function favorite(slug: string) {
    setFavorites(toggleFavorite(slug));
  }

  return (
    <main className="product-page lab-discover-page ui-pass-page">
      <div className="lab-page-index"><span>ITERA / REFERENCE LIBRARY</span><span>{catalog.length.toString().padStart(2, "0")} FICHAS</span></div>
      <header className="product-header lab-product-header compact-product-header"><div><p className="eyebrow">BIBLIOTECA DE PRUEBAS</p><h1>¿Qué quieres poner a prueba?</h1><p>Elige una ficha, cambia una sola cosa y registra una señal concreta durante unos días.</p></div></header>

      <div className="library-tools library-tools-v2">
        <label className="library-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca móvil, sueño, dinero, estudio..." aria-label="Buscar experimentos" /></label>
        <button className={favoritesOnly ? "favorite-filter active" : "favorite-filter"} type="button" onClick={() => setFavoritesOnly((value) => !value)}>★ Favoritos <span>{favorites.length}</span></button>
        <span className="library-count">{filtered.length} resultado{filtered.length === 1 ? "" : "s"}</span>
      </div>

      <div className="filter-row compact-filter-row">{categories.map((item) => <button type="button" onClick={() => setCategory(item)} className={item === category ? "filter-chip active" : "filter-chip"} key={item}>{item}</button>)}</div>

      {filtered.length ? <section className="catalog-grid compact-catalog-grid">
        {filtered.map((item, index) => {
          const isFavorite = favorites.includes(item.slug);
          return (
            <article className="catalog-card lab-catalog-card catalog-card-v2" key={item.slug}>
              <div className="catalog-index-row"><span>REF / {(index + 1).toString().padStart(2, "0")}</span><button type="button" className={isFavorite ? "favorite-button active" : "favorite-button"} onClick={() => favorite(item.slug)} aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}>{isFavorite ? "★" : "☆"}</button></div>
              <div className="catalog-top catalog-top-v2"><span className="experiment-icon large">{item.emoji}</span><div className="catalog-duration"><small>DURACIÓN</small><strong>{item.durationDays} días</strong></div></div>
              <div className="catalog-body"><small className="category-label">{item.category}</small><h2>{item.title}</h2><p>{item.description}</p></div>
              <div className="catalog-hypothesis catalog-section"><small>HIPÓTESIS</small><p>{item.hypothesis}</p></div>
              <div className="catalog-signal-row"><span><small>SEÑAL</small><strong>{item.metricLabel}</strong></span><span><small>ESCALA</small><strong>{item.metricMin}—{item.metricMax}{item.metricUnit}</strong></span></div>
              <button type="button" className="button button-accent full catalog-cta" onClick={() => start(item.slug)}>Probar esta ficha →</button>
            </article>
          );
        })}
      </section> : <div className="empty-state lab-empty"><span>⌕</span><small>SIN COINCIDENCIAS</small><h3>No encontramos esa prueba.</h3><p>Prueba con otra palabra o vuelve a mostrar todas las categorías.</p><button type="button" className="button button-secondary" onClick={() => { setCategory("Todos"); setQuery(""); setFavoritesOnly(false); }}>Limpiar filtros</button></div>}
    </main>
  );
}
