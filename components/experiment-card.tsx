import Link from "next/link";
import { Experiment } from "@/lib/types";

function diffDays(start: string) {
  const startDate = new Date(`${start}T12:00:00`);
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / 86400000) + 1);
}

export default function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const day = Math.min(diffDays(experiment.startDate), experiment.durationDays);
  const progress = Math.round((day / experiment.durationDays) * 100);
  const completed = experiment.entries.filter((entry) => entry.completed).length;
  const average = completed ? experiment.entries.filter((entry) => entry.completed).reduce((sum, entry) => sum + entry.value, 0) / completed : experiment.baseline;
  const delta = ((average - experiment.baseline) / Math.max(experiment.baseline, 0.1)) * 100;

  return (
    <Link className="experiment-card" href={`/app/experiments/${experiment.id}`}>
      <div className="experiment-card-top"><span className="experiment-icon">{experiment.emoji}</span><span className="pill">Día {day}/{experiment.durationDays}</span></div>
      <h3>{experiment.title}</h3>
      <p>{experiment.metricLabel}</p>
      <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
      <div className="experiment-stats"><span><small>Ahora</small><strong>{average.toFixed(1)}{experiment.metricUnit}</strong></span><span><small>Cambio</small><strong className={delta >= 0 ? "positive" : "negative"}>{delta >= 0 ? "+" : ""}{delta.toFixed(0)}%</strong></span></div>
    </Link>
  );
}
