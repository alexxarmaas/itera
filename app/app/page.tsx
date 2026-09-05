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
    <main className="product-page">
      <header className="product-header">
        <div><p className="eyebrow">TU LABORATORIO PERSONAL</p><h1>¿Qué estás probando?</h1><p>Pequeños cambios. Resultados que sí puedes comparar.</p></div>
        <Link className="button button-primary compact" href="/app/new">+ Nuevo experimento</Link>
      </header>

      <section className="stats-strip">
        <div><strong>{active.length}</strong><span>activos</span></div>
        <div><strong>{completed.length}</strong><span>terminados</span></div>
        <div><strong>{totalEntries}</strong><span>check-ins</span></div>
      </section>

      <section className="product-section">
        <div className="section-row"><div><p className="eyebrow">EN CURSO</p><h2>Tus experimentos</h2></div></div>
        {active.length ? <div className="experiment-grid">{active.map((experiment) => <ExperimentCard experiment={experiment} key={experiment.id} />)}</div> : <div className="empty-state"><span>🧪</span><h3>Aún no estás probando nada.</h3><p>Empieza con un cambio pequeño y una métrica sencilla.</p><Link className="button button-primary" href="/app/discover">Encontrar una idea</Link></div>}
      </section>

      {completed.length > 0 && <section className="product-section">
        <div className="section-row"><div><p className="eyebrow">RESULTADOS</p><h2>Lo que ya has aprendido</h2></div></div>
        <div className="experiment-grid">{completed.map((experiment) => <ExperimentCard experiment={experiment} key={experiment.id} />)}</div>
      </section>}

      <section className="insight-card">
        <div className="insight-mark">↗</div>
        <div><p className="eyebrow">PRINCIPIO ITERA</p><h2>No conviertas una idea en hábito antes de saber si te sirve.</h2><p>Hazla temporal, mide una señal concreta y decide con tus propios datos.</p></div>
      </section>
    </main>
  );
}
