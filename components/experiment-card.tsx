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

  return (
    <Link className="experiment-card" href={`/app/experiments/${experiment.id}`}>
      <div className="experiment-card-top">
        <span className="experiment-icon">{experiment.emoji}</span>
        <span className={experiment.status === "completed" ? "pill pill-done" : "pill"}>{experiment.status === "completed" ? "Resultado" : `Día ${day}/${experiment.durationDays}`}</span>
      </div>
      <h3>{experiment.title}</h3>
      <p>{experiment.metricLabel}</p>
      <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
      <div className="experiment-stats">
        <span><small>{experiment.status === "completed" ? "Resultado" : "Ahora"}</small><strong>{metrics.average.toFixed(1)}{experiment.metricUnit}</strong></span>
        <span><small>Cambio</small><strong className={metrics.delta >= 0 ? "positive" : "negative"}>{metrics.delta >= 0 ? "+" : ""}{metrics.delta.toFixed(0)}%</strong></span>
      </div>
    </Link>
  );
}
