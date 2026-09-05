"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ExperimentCard from "@/components/experiment-card";
import { loadExperiments } from "@/lib/storage";
import { Experiment } from "@/lib/types";

export default function DashboardPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  useEffect(() => setExperiments(loadExperiments()), []);

  const active = useMemo(() => experiments.filter((experiment) => experiment.status === "active"), [experiments]);
  const completed = useMemo(() => experiments.filter((experiment) => experiment.status === "completed"), [experiments]);
  const totalEntries = experiments.reduce((sum, experiment) => sum + experiment.entries.length, 0);

  return (
    <main className="product-page lab-dashboard">
      <div className="lab-page-index"><span>ITERA LABBOOK</span><span>INDEX / 001</span></div>
      <header className="product-header lab-product-header">
        <div><p className="eyebrow">TU LABORATORIO PERSONAL</p><h1>¿Qué estás poniendo a prueba?</h1><p>No colecciones hábitos. Acumula evidencia sobre lo que te funciona.</p></div>
        <Link className="button button-accent compact" href="/app/new">+ Nueva prueba</Link>
      </header>

      <section className="stats-strip lab-stats">
        <div><small>ACTIVOS</small><strong>{active.length}</strong><span>pruebas en curso</span></div>
        <div><small>VEREDICTOS</small><strong>{completed.length}</strong><span>experimentos cerrados</span></div>
        <div><small>OBSERVACIONES</small><strong>{totalEntries}</strong><span>check-ins registrados</span></div>
      </section>

      <section className="product-section">
        <div className="section-row"><div><p className="eyebrow">BANCO DE TRABAJO</p><h2>Experimentos en curso</h2></div><span className="section-code">ACTIVE / {String(active.length).padStart(2, "0")}</span></div>
        {active.length ? <div className="experiment-grid">{active.map((experiment) => <ExperimentCard experiment={experiment} key={experiment.id} />)}</div> : <div className="empty-state lab-empty"><span>+</span><small>FICHA VACÍA</small><h3>Tu laboratorio está esperando una pregunta.</h3><p>Empieza por algo pequeño: una semana, un cambio y una señal concreta.</p><Link className="button button-accent" href="/app/discover">Encontrar una prueba</Link></div>}
      </section>

      {completed.length > 0 && <section className="product-section">
        <div className="section-row"><div><p className="eyebrow">ARCHIVO</p><h2>Veredictos anteriores</h2></div><span className="section-code">CLOSED / {String(completed.length).padStart(2, "0")}</span></div>
        <div className="experiment-grid">{completed.map((experiment) => <ExperimentCard experiment={experiment} key={experiment.id} />)}</div>
      </section>}

      <section className="insight-card lab-principle">
        <div className="insight-mark">↗</div>
        <div><p className="eyebrow">PRINCIPIO 01</p><h2>Una intuición no merece convertirse en rutina hasta superar una prueba.</h2><p>Hazla temporal. Observa una señal. Decide con tus propios datos.</p></div>
        <span className="principle-stamp">ITERA<br/>METHOD</span>
      </section>
    </main>
  );
}
