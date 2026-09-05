"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadExperiments } from "@/lib/storage";
import { experimentMetrics } from "@/lib/results";
import { Experiment } from "@/lib/types";

const decisionMeta = {
  keep: { label: "ME LO QUEDO", icon: "✓", copy: "Este cambio merece formar parte de tu forma de hacer las cosas." },
  discard: { label: "LO DESCARTO", icon: "×", copy: "Lo probaste y no compensa mantenerlo." },
  repeat: { label: "REPETIR", icon: "↻", copy: "La señal no es suficiente. Merece una segunda prueba." },
  variant: { label: "PROBAR VARIANTE", icon: "≈", copy: "Hay algo aquí, pero quieres cambiar una condición." },
} as const;

export default function ManualPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [filter, setFilter] = useState<"all" | "known" | "review">("all");
  useEffect(() => setExperiments(loadExperiments()), []);

  const completed = useMemo(() => experiments.filter((experiment) => experiment.status === "completed"), [experiments]);
  const known = completed.filter((experiment) => experiment.decision === "keep" || experiment.decision === "discard");
  const review = completed.filter((experiment) => !experiment.decision || experiment.decision === "repeat" || experiment.decision === "variant");
  const visible = filter === "known" ? known : filter === "review" ? review : completed;

  return (
    <main className="product-page manual-page">
      <div className="lab-page-index"><span>ITERA / PERSONAL MANUAL</span><span>{completed.length.toString().padStart(2, "0")} APRENDIZAJES</span></div>
      <header className="product-header compact-product-header"><div><p className="eyebrow">MI MANUAL PERSONAL</p><h1>Lo que ya sabes sobre ti.</h1><p>Itera no guarda hábitos: guarda conclusiones que has puesto a prueba.</p></div><Link className="button button-accent compact" href="/app/discover">+ Probar algo nuevo</Link></header>

      <section className="manual-stats"><div><small>CONCLUSIONES</small><strong>{known.length}</strong><span>cosas que ya sabes</span></div><div><small>ME FUNCIONA</small><strong>{completed.filter((item) => item.decision === "keep").length}</strong><span>cambios que conservar</span></div><div><small>DESCARTADAS</small><strong>{completed.filter((item) => item.decision === "discard").length}</strong><span>ideas que no compensan</span></div><div><small>POR REVISAR</small><strong>{review.length}</strong><span>pruebas pendientes</span></div></section>

      <div className="manual-tabs"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todo <span>{completed.length}</span></button><button className={filter === "known" ? "active" : ""} onClick={() => setFilter("known")}>Conclusiones <span>{known.length}</span></button><button className={filter === "review" ? "active" : ""} onClick={() => setFilter("review")}>Por revisar <span>{review.length}</span></button></div>

      {visible.length ? <section className="manual-grid">{visible.map((experiment) => {
        const metrics = experimentMetrics(experiment);
        const decision = experiment.decision ? decisionMeta[experiment.decision] : null;
        const isAB = (experiment.mode ?? "single") === "ab";
        return <article className={`manual-card decision-${experiment.decision ?? "pending"}`} key={experiment.id}>
          <div className="manual-card-head"><span className="experiment-icon">{experiment.emoji}</span><span className="manual-stamp">{decision ? `${decision.icon} ${decision.label}` : "? FALTA DECIDIR"}</span></div>
          <small className="category-label">{experiment.category}</small><h2>{experiment.title}</h2>
          <div className="manual-result">{isAB ? <><strong>{metrics.winner ? (metrics.winner === "A" ? experiment.variantA : experiment.variantB) : "Sin ganador claro"}</strong><span>{metrics.aAverage.toFixed(1)} vs {metrics.bAverage.toFixed(1)}{experiment.metricUnit}</span></> : <><strong className={metrics.delta >= 0 ? "positive" : "negative"}>{metrics.delta >= 0 ? "+" : ""}{metrics.delta.toFixed(0)}%</strong><span>en {experiment.metricLabel.toLowerCase()}</span></>}</div>
          <p>{decision?.copy ?? "El experimento terminó, pero todavía no has decidido qué hacer con el resultado."}</p>
          {experiment.decisionNote && <blockquote>{experiment.decisionNote}</blockquote>}
          <div className="manual-meta"><span>EVIDENCIA · {metrics.evidence}</span><span>{metrics.done} CHECK-INS</span></div>
          <Link className="button button-secondary full" href={`/app/experiments/${experiment.id}`}>{decision ? "Abrir conclusión →" : "Tomar decisión →"}</Link>
        </article>;
      })}</section> : <div className="empty-state lab-empty"><span>≡</span><small>MANUAL VACÍO</small><h3>Aún no tienes conclusiones.</h3><p>Termina un experimento y decide qué hacer con el resultado. Ahí empezará a construirse tu manual personal.</p><Link className="button button-accent" href="/app/discover">Elegir una prueba</Link></div>}
    </main>
  );
}
