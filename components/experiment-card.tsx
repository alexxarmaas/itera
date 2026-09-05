"use client";

import Link from "next/link";
import { Experiment } from "@/lib/types";
import { experimentMetrics, experimentProgress } from "@/lib/results";
import { archiveExperiment, duplicateExperiment, pauseExperiment, resumeExperiment } from "@/lib/storage";

export default function ExperimentCard({ experiment, onChanged }: { experiment: Experiment; onChanged?: () => void }) {
  const metrics = experimentMetrics(experiment);
  const progressData = experimentProgress(experiment);
  const progress = Math.round(progressData.progress * 100);
  const readout = metrics.done < 3 ? "Recogiendo señal" : metrics.delta > 8 ? "Señal positiva" : metrics.delta < -8 ? "Señal negativa" : "Señal estable";
  const statusLabel = experiment.status === "completed" ? "VEREDICTO" : experiment.status === "paused" ? "PAUSADO" : experiment.status === "abandoned" ? "ARCHIVADO" : `DÍA ${progressData.day}/${experiment.durationDays}`;

  function mutate(action: () => unknown) {
    action();
    onChanged?.();
  }

  return (
    <article className={`experiment-card lab-experiment-card status-${experiment.status}`}>
      <Link className="card-main-link" href={`/app/experiments/${experiment.id}`}>
        <div className="card-index">EXP / {experiment.id.slice(-4).toUpperCase()}</div>
        <div className="experiment-card-top">
          <span className="experiment-icon">{experiment.emoji}</span>
          <span className={experiment.status === "completed" ? "pill pill-done" : "pill"}>{statusLabel}</span>
        </div>
        <small className="category-label">{experiment.category}</small>
        <h3>{experiment.title}</h3>
        <p className="card-hypothesis">{experiment.hypothesis}</p>
        <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        <div className="experiment-stats">
          <span><small>SEÑAL</small><strong>{metrics.average.toFixed(1)}{experiment.metricUnit}</strong></span>
          <span><small>DELTA</small><strong className={metrics.delta >= 0 ? "positive" : "negative"}>{metrics.delta >= 0 ? "+" : ""}{metrics.delta.toFixed(0)}%</strong></span>
          <span><small>COBERTURA</small><strong>{Math.round(progressData.coverage * 100)}%</strong></span>
        </div>
        <div className="card-readout"><i className={metrics.done >= 3 && metrics.delta < -8 ? "negative-dot" : ""} /><span>{readout}</span><small>{metrics.done} check-ins</small></div>
      </Link>
      <div className="card-actions" aria-label="Acciones del experimento">
        {experiment.status === "active" && <button type="button" onClick={() => mutate(() => pauseExperiment(experiment.id))}>Pausar</button>}
        {experiment.status === "paused" && <button type="button" onClick={() => mutate(() => resumeExperiment(experiment.id))}>Reanudar</button>}
        {(experiment.status === "active" || experiment.status === "paused") && <button type="button" onClick={() => mutate(() => archiveExperiment(experiment.id))}>Archivar</button>}
        <button type="button" onClick={() => mutate(() => duplicateExperiment(experiment.id))}>{experiment.status === "completed" || experiment.status === "abandoned" ? "Repetir" : "Duplicar"}</button>
        <Link href={`/app/experiments/${experiment.id}`}>Abrir →</Link>
      </div>
    </article>
  );
}
