import { Experiment } from "@/lib/types";

export default function MetricTrend({ experiment }: { experiment: Experiment }) {
  const entries = [...experiment.entries].sort((a, b) => a.date.localeCompare(b.date));
  if (entries.length < 2) return <div className="trend-empty">Añade dos check-ins para ver la tendencia.</div>;

  const width = 320;
  const height = 110;
  const pad = 10;
  const range = Math.max(1, experiment.metricMax - experiment.metricMin);
  const x = (index: number) => pad + (index / Math.max(1, entries.length - 1)) * (width - pad * 2);
  const y = (value: number) => pad + (1 - (value - experiment.metricMin) / range) * (height - pad * 2);
  const points = entries.map((entry, index) => `${x(index)},${y(entry.value)}`).join(" ");
  const baselineY = y(experiment.baseline);
  const latest = entries.at(-1)?.value ?? experiment.baseline;

  return (
    <div className="metric-trend">
      <div className="trend-head"><span>TENDENCIA</span><strong>{latest.toFixed(1)}{experiment.metricUnit}</strong></div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Tendencia de ${experiment.metricLabel}`}>
        <line className="trend-baseline" x1={pad} x2={width - pad} y1={baselineY} y2={baselineY} />
        <polyline className="trend-line" points={points} />
        {entries.map((entry, index) => <circle className="trend-point" cx={x(index)} cy={y(entry.value)} r="3.5" key={`${entry.date}-${index}`} />)}
      </svg>
      <div className="trend-foot"><span>Inicio {experiment.baseline.toFixed(1)}{experiment.metricUnit}</span><span>{entries.length} registros</span></div>
    </div>
  );
}
