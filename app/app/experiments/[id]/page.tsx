"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getExperiment, saveExperiment, todayKey } from "@/lib/storage";
import { experimentMetrics } from "@/lib/results";
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
  const [shareState, setShareState] = useState("Compartir resultado");

  useEffect(() => {
    const found = getExperiment(params.id);
    setExperiment(found ?? null);
    if (found) {
      const today = found.entries.find((entry) => entry.date === todayKey());
      if (today) { setValue(today.value); setCompleted(today.completed); setNote(today.note ?? ""); }
      else setValue(Math.round(found.baseline));
    }
  }, [params.id]);

  if (!experiment) return <main className="product-page"><div className="empty-state"><span>🧪</span><h2>No encontramos este experimento.</h2><Link className="button button-primary" href="/app">Volver al inicio</Link></div></main>;

  const current = experiment;
  const metrics = experimentMetrics(current);
  const day = Math.min(daysBetween(current.startDate), current.durationDays);
  const progress = current.status === "completed" ? 100 : Math.round((day / current.durationDays) * 100);

  function submit(event: FormEvent) {
    event.preventDefault();
    const date = todayKey();
    const entry = { date, completed, value, note: note.trim() || undefined };
    const exists = current.entries.some((item) => item.date === date);
    const next: Experiment = { ...current, entries: exists ? current.entries.map((item) => item.date === date ? entry : item) : [...current.entries, entry] };
    saveExperiment(next);
    setExperiment(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function finishExperiment() {
    if (metrics.done < 3) return;
    const next: Experiment = { ...current, status: "completed", completedDate: todayKey() };
    saveExperiment(next);
    setExperiment(next);
  }

  function shareUrl() {
    const query = new URLSearchParams({
      title: current.title,
      emoji: current.emoji,
      category: current.category,
      metric: current.metricLabel,
      unit: current.metricUnit,
      baseline: current.baseline.toFixed(1),
      average: metrics.average.toFixed(1),
      delta: metrics.delta.toFixed(0),
      days: String(day),
      duration: String(current.durationDays),
      hypothesis: current.hypothesis,
      checks: String(metrics.done),
    });
    return `${window.location.origin}/share?${query.toString()}`;
  }

  async function shareResult() {
    const url = shareUrl();
    const text = `${current.emoji} Probé “${current.title}” en Itera. ${metrics.verdict}. ${metrics.delta >= 0 ? "+" : ""}${metrics.delta.toFixed(0)}% en ${current.metricLabel.toLowerCase()}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mi resultado en Itera", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareState("✓ Enlace copiado");
      window.setTimeout(() => setShareState("Compartir resultado"), 1800);
    } catch {
      setShareState("Copia el enlace");
      window.prompt("Copia este enlace para compartir tu resultado", url);
    }
  }

  if (current.status === "completed") {
    return (
      <main className="product-page detail-page">
        <Link className="back-link" href="/app">← Mis experimentos</Link>
        <section className="final-result">
          <div className="final-result-top"><span className="experiment-icon xl">{current.emoji}</span><span className="pill pill-done">Experimento terminado</span></div>
          <p className="eyebrow">TU RESULTADO</p>
          <h1>{current.title}</h1>
          <p className={`final-verdict ${metrics.tone}`}>{metrics.verdict}.</p>
          <div className="final-metric"><strong>{metrics.delta >= 0 ? "+" : ""}{metrics.delta.toFixed(0)}%</strong><span>en {current.metricLabel.toLowerCase()}</span></div>
          <div className="comparison final-comparison"><div><small>Antes</small><strong>{current.baseline.toFixed(1)}{current.metricUnit}</strong></div><span>→</span><div><small>Durante</small><strong>{metrics.average.toFixed(1)}{current.metricUnit}</strong></div></div>
          <p className="final-context">{metrics.done} check-ins · {day} días desde que empezaste. El resultado se basa en tus propios registros y no pretende ser evidencia científica.</p>
          <div className="final-actions"><button className="button button-primary" type="button" onClick={shareResult}>{shareState}</button><Link className="button button-secondary" href="/app/discover">Probar otra cosa</Link></div>
        </section>
        <section className="history-card"><div className="section-row"><div><p className="eyebrow">HISTORIAL</p><h2>Los datos detrás del resultado</h2></div></div><div className="entry-list">{[...current.entries].reverse().map((entry) => <div className="entry-row" key={entry.date}><span>{entry.date}</span><span>{entry.completed ? "✓ Hecho" : "— No"}</span><strong>{entry.value}{current.metricUnit}</strong><span className="entry-note">{entry.note ?? ""}</span></div>)}</div></section>
      </main>
    );
  }

  return (
    <main className="product-page detail-page">
      <Link className="back-link" href="/app">← Mis experimentos</Link>
      <section className="detail-hero">
        <div className="detail-title"><span className="experiment-icon xl">{current.emoji}</span><div><small className="category-label">{current.category}</small><h1>{current.title}</h1><p>{current.hypothesis}</p></div></div>
        <div className="detail-progress"><div><strong>Día {day}</strong><span>de {current.durationDays}</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><small>{progress}% completado</small></div>
      </section>

      <div className="detail-grid">
        <section className="checkin-card">
          <p className="eyebrow">CHECK-IN DE HOY</p><h2>¿Cómo ha ido?</h2>
          <form onSubmit={submit}>
            <div className="binary-row"><button type="button" className={completed ? "binary active" : "binary"} onClick={() => setCompleted(true)}>✓ Sí, lo hice</button><button type="button" className={!completed ? "binary active" : "binary"} onClick={() => setCompleted(false)}>No hoy</button></div>
            <label className="range-label"><span>{current.metricLabel}</span><strong>{value}{current.metricUnit}</strong></label>
            <input className="range" type="range" min={current.metricMin} max={current.metricMax} step={0.5} value={value} onChange={(event) => setValue(Number(event.target.value))} />
            <div className="range-scale"><span>{current.metricMin}</span><span>{current.metricMax}</span></div>
            <label><span>Nota opcional</span><textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="¿Algo que pueda explicar el resultado?" /></label>
            <button className="button button-primary full" type="submit">{saved ? "✓ Guardado" : "Guardar check-in"}</button>
          </form>
        </section>

        <section className="result-card">
          <p className="eyebrow">SEÑAL HASTA AHORA</p><div className="result-number"><strong>{metrics.delta >= 0 ? "+" : ""}{metrics.delta.toFixed(0)}%</strong><span>vs. tu punto de partida</span></div>
          <div className="comparison"><div><small>Antes</small><strong>{current.baseline.toFixed(1)}{current.metricUnit}</strong></div><span>→</span><div><small>Durante</small><strong>{metrics.average.toFixed(1)}{current.metricUnit}</strong></div></div>
          <p className="result-note">{metrics.done < 3 ? "Aún hay pocos datos. Con 3 check-ins podrás obtener un primer resultado." : metrics.delta > 8 ? "La señal es positiva. Puedes seguir hasta el final o cerrar la prueba cuando ya tengas suficiente información." : metrics.delta < -8 ? "Por ahora el cambio no está mejorando esta métrica." : "Por ahora el cambio parece tener poco efecto sobre esta métrica."}</p>
          <small>{metrics.done} check-ins completados</small>
          <button className="button button-secondary full finish-button" type="button" disabled={metrics.done < 3} onClick={finishExperiment}>{metrics.done < 3 ? `Necesitas ${3 - metrics.done} check-in${3 - metrics.done === 1 ? "" : "s"} más` : "Finalizar y ver resultado →"}</button>
        </section>
      </div>

      <section className="history-card"><div className="section-row"><div><p className="eyebrow">HISTORIAL</p><h2>Lo que has registrado</h2></div></div>{current.entries.length ? <div className="entry-list">{[...current.entries].reverse().map((entry) => <div className="entry-row" key={entry.date}><span>{entry.date}</span><span>{entry.completed ? "✓ Hecho" : "— No"}</span><strong>{entry.value}{current.metricUnit}</strong><span className="entry-note">{entry.note ?? ""}</span></div>)}</div> : <p className="muted">Tu primer check-in aparecerá aquí.</p>}</section>
    </main>
  );
}
