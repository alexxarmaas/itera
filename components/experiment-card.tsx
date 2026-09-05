import Link from "next/link";
import { Experiment } from "@/lib/types";
import { experimentMetrics } from "@/lib/results";

function diffDays(start: string) {
  const startDate = new Date(`${start}T12:00:00`);
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / 86400000) + 1);
}

export default function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const day = Math.min(diffDays(experiment.startDate), experiment.durationDays);
  const progress = experiment.status === "completed" ? 100 : Math.round((day / experiment.durationDays) * 100);
  const metrics = experimentMetrics(experiment);
  const readout = metrics.done < 3 ? "Recogiendo señal" : metrics.delta > 8 ? "Señal positiva" : metrics.delta < -8 ? "Señal negativa" : "Señal estable";

  return (
    <Link className="experiment-card lab-experiment-card" href={`/app/experiments/${experiment.id}`}>
      <div className="card-index">EXP / {experiment.id.slice(-4).toUpperCase()}</div>
      <div className="experiment-card-top">
        <span className="experiment-icon">{experiment.emoji}</span>
        <span className={experiment.status === "completed" ? "pill pill-done" : "pill"}>{experiment.status === "completed" ? "VEREDICTO" : `DÍA ${day}/${experiment.durationDays}`}</span>
      </div>
      <small className="category-label">{experiment.category}</small>
      <h3>{experiment.title}</h3>
      <p className="card-hypothesis">{experiment.hypothesis}</p>
      <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
      <div className="experiment-stats">
        <span><small>{experiment.status === "completed" ? "RESULTADO" : "LECTURA"}</small><strong>{metrics.average.toFixed(1)}{experiment.metricUnit}</strong></span>
        <span><small>DELTA</small><strong className={metrics.delta >= 0 ? "positive" : "negative"}>{metrics.delta >= 0 ? "+" : ""}{metrics.delta.toFixed(0)}%</strong></span>
      </div>
      <div className="card-readout"><i className={metrics.done >= 3 && metrics.delta < -8 ? "negative-dot" : ""} /><span>{readout}</span><small>{metrics.done} check-ins</small></div>
    </Link>
  );
}
