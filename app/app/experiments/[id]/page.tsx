"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getExperiment, saveExperiment, todayKey } from "@/lib/storage";
import { Experiment } from "@/lib/types";

function daysBetween(start: string) {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date();
  b.setHours(12, 0, 0, 0);
  return Math.max(1, Math.floor((b.getTime() - a.getTime()) / 86400000) + 1);
}

export default function ExperimentDetailPage() {
  const params = useParams<{ id: string }>();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [value, setValue] = useState(7);
  const [completed, setCompleted] = useState(true);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const found = getExperiment(params.id);
    setExperiment(found ?? null);
    if (found) {
      const today = found.entries.find((entry) => entry.date === todayKey());
      if (today) { setValue(today.value); setCompleted(today.completed); setNote(today.note ?? ""); }
      else setValue(Math.round(found.baseline));
    }
  }, [params.id]);

  const metrics = useMemo(() => {
    if (!experiment) return { average: 0, delta: 0, done: 0 };
    const valid = experiment.entries.filter((entry) => entry.completed);
    const average = valid.length ? valid.reduce((sum, entry) => sum + entry.value, 0) / valid.length : experiment.baseline;
    const delta = ((average - experiment.baseline) / Math.max(experiment.baseline, 0.1)) * 100;
    return { average, delta, done: valid.length };
  }, [experiment]);

  if (!experiment) return <main className="product-page"><div className="empty-state"><span>🧪</span><h2>No encontramos este experimento.</h2><Link className="button button-primary" href="/app">Volver al inicio</Link></div></main>;

  const day = Math.min(daysBetween(experiment.startDate), experiment.durationDays);
  const progress = Math.round((day / experiment.durationDays) * 100);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!experiment) return;
    const date = todayKey();
    const entry = { date, completed, value, note: note.trim() || undefined };
    const exists = experiment.entries.some((item) => item.date === date);
    const next = { ...experiment, entries: exists ? experiment.entries.map((item) => item.date === date ? entry : item) : [...experiment.entries, entry] };
    saveExperiment(next);
    setExperiment(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <main className="product-page detail-page">
      <Link className="back-link" href="/app">← Mis experimentos</Link>
      <section className="detail-hero">
        <div className="detail-title"><span className="experiment-icon xl">{experiment.emoji}</span><div><small className="category-label">{experiment.category}</small><h1>{experiment.title}</h1><p>{experiment.hypothesis}</p></div></div>
        <div className="detail-progress"><div><strong>Día {day}</strong><span>de {experiment.durationDays}</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><small>{progress}% completado</small></div>
      </section>

      <div className="detail-grid">
        <section className="checkin-card">
          <p className="eyebrow">CHECK-IN DE HOY</p><h2>¿Cómo ha ido?</h2>
          <form onSubmit={submit}>
            <div className="binary-row"><button type="button" className={completed ? "binary active" : "binary"} onClick={() => setCompleted(true)}>✓ Sí, lo hice</button><button type="button" className={!completed ? "binary active" : "binary"} onClick={() => setCompleted(false)}>No hoy</button></div>
            <label className="range-label"><span>{experiment.metricLabel}</span><strong>{value}{experiment.metricUnit}</strong></label>
            <input className="range" type="range" min={experiment.metricMin} max={experiment.metricMax} step={0.5} value={value} onChange={(event) => setValue(Number(event.target.value))} />
            <div className="range-scale"><span>{experiment.metricMin}</span><span>{experiment.metricMax}</span></div>
            <label><span>Nota opcional</span><textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="¿Algo que pueda explicar el resultado?" /></label>
            <button className="button button-primary full" type="submit">{saved ? "✓ Guardado" : "Guardar check-in"}</button>
          </form>
        </section>

        <section className="result-card">
          <p className="eyebrow">SEÑAL HASTA AHORA</p><div className="result-number"><strong>{metrics.delta >= 0 ? "+" : ""}{metrics.delta.toFixed(0)}%</strong><span>vs. tu punto de partida</span></div>
          <div className="comparison"><div><small>Antes</small><strong>{experiment.baseline.toFixed(1)}{experiment.metricUnit}</strong></div><span>→</span><div><small>Durante</small><strong>{metrics.average.toFixed(1)}{experiment.metricUnit}</strong></div></div>
          <p className="result-note">{metrics.done < 3 ? "Aún hay pocos datos. Sigue unos días antes de sacar conclusiones." : metrics.delta > 8 ? "La señal es positiva. Sigue hasta el final para comprobar si se mantiene." : metrics.delta < -8 ? "Por ahora el cambio no está mejorando esta métrica." : "Por ahora el cambio parece tener poco efecto sobre esta métrica."}</p>
          <small>{metrics.done} check-ins completados</small>
        </section>
      </div>

      <section className="history-card"><div className="section-row"><div><p className="eyebrow">HISTORIAL</p><h2>Lo que has registrado</h2></div></div>{experiment.entries.length ? <div className="entry-list">{[...experiment.entries].reverse().map((entry) => <div className="entry-row" key={entry.date}><span>{entry.date}</span><span>{entry.completed ? "✓ Hecho" : "— No"}</span><strong>{entry.value}{experiment.metricUnit}</strong><span className="entry-note">{entry.note ?? ""}</span></div>)}</div> : <p className="muted">Tu primer check-in aparecerá aquí.</p>}</section>
    </main>
  );
}
