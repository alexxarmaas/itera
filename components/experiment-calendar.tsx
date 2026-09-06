import { Experiment } from "@/lib/types";
import { addDaysKey, localDateKey } from "@/lib/dates";
import { baselineEntries } from "@/lib/results";

export default function ExperimentCalendar({ experiment }: { experiment: Experiment }) {
  const baseline = baselineEntries(experiment).sort((a, b) => a.date.localeCompare(b.date));
  const today = localDateKey();
  const mode = experiment.mode ?? "single";
  const pausedShift = Math.max(0, experiment.pausedDays ?? 0);

  return (
    <section className="experiment-calendar">
      <div className="calendar-head"><div><p className="eyebrow">CALENDARIO</p><h3>Mapa de la prueba</h3></div><span>{mode === "ab" ? "A/B ALTERNADO" : `${experiment.durationDays} DÍAS`}</span></div>
      {baseline.length > 0 && <div className="baseline-strip"><small>BASELINE</small><div>{baseline.map((entry, index) => <span className="baseline-dot done" title={`${entry.date}: ${entry.value}${experiment.metricUnit}`} key={`${entry.date}-${index}`}>{index + 1}</span>)}</div></div>}
      <div className="calendar-weekdays">{["L","M","X","J","V","S","D"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">
        {Array.from({ length: experiment.durationDays }, (_, index) => {
          const date = addDaysKey(experiment.startDate, index);
          const stored = experiment.entries.find((item) => (item.phase ?? "test") === "test" && item.date === date);
          const adjustedIndex = Math.max(0, index - pausedShift);
          const expectedVariant = mode === "ab" ? (stored?.variant ?? (adjustedIndex % 2 === 0 ? "A" : "B")) : undefined;
          const entry = experiment.entries.find((item) => (item.phase ?? "test") === "test" && item.date === date && (!expectedVariant || item.variant === expectedVariant));
          const future = date > today;
          const state = entry ? (entry.completed ? "done" : "miss") : future ? "future" : "empty";
          const label = mode === "ab" ? expectedVariant : String(index + 1);
          return <span className={`calendar-cell ${state} ${expectedVariant ? `variant-${expectedVariant.toLowerCase()}` : ""}`} title={`${date}${entry ? ` · ${entry.value}${experiment.metricUnit}` : ""}`} key={date}>{label}</span>;
        })}
      </div>
      <div className="calendar-legend"><span><i className="legend-done" /> registrado</span><span><i className="legend-miss" /> no cumplido</span><span><i className="legend-empty" /> sin registro</span>{mode === "ab" && <span>A/B = condición del día</span>}</div>
    </section>
  );
}
