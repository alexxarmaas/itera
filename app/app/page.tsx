"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ExperimentCard from "@/components/experiment-card";
import { loadExperiments } from "@/lib/storage";
import { loadFavorites } from "@/lib/preferences";
import { experimentMetrics, experimentProgress } from "@/lib/results";
import { Experiment, ExperimentStatus } from "@/lib/types";

type View = "all" | "active" | "paused" | "completed" | "abandoned";
type Sort = "recent" | "progress" | "signal";

const views: { value: View; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "En curso" },
  { value: "paused", label: "Pausados" },
  { value: "completed", label: "Resultados" },
  { value: "abandoned", label: "Archivo" },
];

export default function DashboardPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [view, setView] = useState<View>("all");
  const [sort, setSort] = useState<Sort>("recent");

  function refresh() {
    setExperiments(loadExperiments());
  }

  useEffect(() => refresh(), []);

  const counts = useMemo(() => experiments.reduce<Record<ExperimentStatus, number>>((acc, experiment) => {
    acc[experiment.status] += 1;
    return acc;
  }, { active: 0, paused: 0, completed: 0, abandoned: 0 }), [experiments]);

  const visible = useMemo(() => {
    const filtered = view === "all" ? [...experiments] : experiments.filter((experiment) => experiment.status === view);
    return filtered.sort((a, b) => {
      if (sort === "progress") return experimentProgress(b).progress - experimentProgress(a).progress;
      if (sort === "signal") return Math.abs(experimentMetrics(b).delta) - Math.abs(experimentMetrics(a).delta);
      return b.startDate.localeCompare(a.startDate);
    });
  }, [experiments, view, sort]);

  const totalEntries = experiments.reduce((sum, experiment) => sum + experiment.entries.length, 0);
  const tracked = experiments.filter((experiment) => experiment.status !== "abandoned");
  const averageCoverage = tracked.length ? tracked.reduce((sum, experiment) => sum + experimentProgress(experiment).coverage, 0) / tracked.length : 0;

  function exportData() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      experiments,
      favorites: loadFavorites(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `itera-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="product-page lab-dashboard ui-pass-page">
      <div className="lab-page-index"><span>ITERA LABBOOK</span><span>INDEX / 001</span></div>
      <header className="product-header lab-product-header compact-product-header">
        <div><p className="eyebrow">TU LABORATORIO PERSONAL</p><h1>¿Qué estás poniendo a prueba?</h1><p>No colecciones hábitos. Acumula evidencia sobre lo que te funciona.</p></div>
        <div className="header-actions"><button className="button button-secondary compact" type="button" onClick={exportData}>Exportar datos</button><Link className="button button-accent compact" href="/app/new">+ Nueva prueba</Link></div>
      </header>

      <section className="stats-strip lab-stats dashboard-stats">
        <div><small>EN CURSO</small><strong>{counts.active}</strong><span>pruebas activas</span></div>
        <div><small>PAUSADAS</small><strong>{counts.paused}</strong><span>contador congelado</span></div>
        <div><small>VEREDICTOS</small><strong>{counts.completed}</strong><span>resultados cerrados</span></div>
        <div><small>COBERTURA</small><strong>{Math.round(averageCoverage * 100)}%</strong><span>{totalEntries} check-ins</span></div>
      </section>

      <section className="product-section experiment-archive-section">
        <div className="section-row archive-heading"><div><p className="eyebrow">ARCHIVO DE PRUEBAS</p><h2>Tus experimentos</h2></div><span className="section-code">{String(visible.length).padStart(2, "0")} FICHAS</span></div>
        <div className="experiment-toolbar">
          <div className="view-tabs" role="tablist" aria-label="Filtrar experimentos">{views.map((item) => <button key={item.value} type="button" className={view === item.value ? "active" : ""} onClick={() => setView(item.value)}>{item.label}{item.value !== "all" && <span>{counts[item.value]}</span>}</button>)}</div>
          <label className="sort-control"><span>Ordenar</span><select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="recent">Más recientes</option><option value="progress">Más avanzados</option><option value="signal">Mayor señal</option></select></label>
        </div>

        {visible.length ? <div className="experiment-grid">{visible.map((experiment) => <ExperimentCard experiment={experiment} key={experiment.id} onChanged={refresh} />)}</div> : <div className="empty-state lab-empty"><span>+</span><small>SIN FICHAS</small><h3>No hay experimentos en esta vista.</h3><p>Cambia el filtro o abre una nueva prueba.</p><Link className="button button-accent" href="/app/discover">Encontrar una prueba</Link></div>}
      </section>

      <section className="insight-card lab-principle compact-principle">
        <div className="insight-mark">↗</div>
        <div><p className="eyebrow">PRINCIPIO 01</p><h2>Una intuición no merece convertirse en rutina hasta superar una prueba.</h2><p>Hazla temporal. Observa una señal. Decide con tus propios datos.</p></div>
        <span className="principle-stamp">ITERA<br/>METHOD</span>
      </section>
    </main>
  );
}
