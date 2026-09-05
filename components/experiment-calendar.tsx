import { Experiment } from "@/lib/types";
import { baselineEntries, currentABVariant } from "@/lib/results";

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function todayKey() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

export default function ExperimentCalendar({ experiment }: { experiment: Experiment }) {
  const baseline = baselineEntries(experiment).sort((a, b) => a.date.localeCompare(b.date));
  const today = todayKey();
  const mode = experiment.mode ?? "single";

  return (
    <section className="experiment-calendar">
      <div className="calendar-head"><div><p className="eyebrow">CALENDARIO</p><h3>Mapa de la prueba</h3></div><span>{mode === "ab" ? "A/B ALTERNADO" : `${experiment.durationDays} DÍAS`}</span></div>
      {baseline.length > 0 && <div className="baseline-strip"><small>BASELINE</small><div>{baseline.map((entry, index) => <span className="baseline-dot done" title={`${entry.date}: ${entry.value}${experiment.metricUnit}`} key={`${entry.date}-${index}`}>{index + 1}</span>)}</div></div>}
      <div className="calendar-weekdays">{["L","M","X","J","V","S","D"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">
        {Array.from({ length: experiment.durationDays }, (_, index) => {
          const date = addDays(experiment.startDate, index);
          const expectedVariant = mode === "ab" ? (index % 2 === 0 ? "A" : "B") : undefined;
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
