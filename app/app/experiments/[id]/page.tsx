"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import MetricTrend from "@/components/metric-trend";
import { archiveExperiment, deleteExperiment, duplicateExperiment, getExperiment, pauseExperiment, resumeExperiment, saveExperiment, todayKey } from "@/lib/storage";
import { effectiveExperimentDay, experimentMetrics, experimentProgress } from "@/lib/results";
import { Experiment, ExperimentEntry } from "@/lib/types";

export default function ExperimentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [value, setValue] = useState(7);
  const [completed, setCompleted] = useState(true);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [shareState, setShareState] = useState("Compartir resultado");

  function syncForm(found: Experiment) {
    const today = found.entries.find((entry) => entry.date === todayKey());
    if (today) { setValue(today.value); setCompleted(today.completed); setNote(today.note ?? ""); }
    else { setValue(Math.round(found.baseline)); setCompleted(true); setNote(""); }
  }

  useEffect(() => {
    const found = getExperiment(params.id);
    setExperiment(found ?? null);
    if (found) syncForm(found);
  }, [params.id]);

  if (!experiment) return <main className="product-page"><div className="empty-state"><span>🧪</span><h2>No encontramos este experimento.</h2><Link className="button button-primary" href="/app">Volver al inicio</Link></div></main>;

  const current = experiment;
  const metrics = experimentMetrics(current);
  const progressData = experimentProgress(current);
  const day = effectiveExperimentDay(current);
  const progress = Math.round(progressData.progress * 100);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (current.status !== "active") return;
    const date = editingDate ?? todayKey();
    const entry: ExperimentEntry = { date, completed, value, note: note.trim() || undefined };
    const exists = current.entries.some((item) => item.date === date);
    const next: Experiment = { ...current, entries: exists ? current.entries.map((item) => item.date === date ? entry : item) : [...current.entries, entry] };
    saveExperiment(next);
    setExperiment(next);
    setEditingDate(null);
    syncForm(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function startEdit(entry: ExperimentEntry) {
    if (current.status !== "active") return;
    setEditingDate(entry.date);
    setValue(entry.value);
    setCompleted(entry.completed);
    setNote(entry.note ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeEntry(date: string) {
    if (!window.confirm("¿Eliminar este check-in?")) return;
    const next = { ...current, entries: current.entries.filter((entry) => entry.date !== date) };
    saveExperiment(next);
    setExperiment(next);
    if (editingDate === date) { setEditingDate(null); syncForm(next); }
  }

  function finishExperiment() {
    if (metrics.done < 3 || current.status !== "active") return;
    const next: Experiment = { ...current, status: "completed", completedDate: todayKey() };
    saveExperiment(next);
    setExperiment(next);
  }

  function changeStatus(action: "pause" | "resume" | "archive") {
    const next = action === "pause" ? pauseExperiment(current.id) : action === "resume" ? resumeExperiment(current.id) : archiveExperiment(current.id);
    if (next) setExperiment(next);
  }

  function repeatExperiment() {
    const next = duplicateExperiment(current.id);
    if (next) router.push(`/app/experiments/${next.id}`);
  }

  function removeExperiment() {
    if (!window.confirm("¿Eliminar esta ficha y todos sus check-ins? Esta acción no se puede deshacer.")) return;
    deleteExperiment(current.id);
    router.push("/app");
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
      <main className="product-page detail-page ui-pass-page">
        <div className="detail-topbar"><Link className="back-link" href="/app">← Mis experimentos</Link><div className="detail-actions"><button type="button" onClick={repeatExperiment}>Repetir</button><button type="button" className="danger-link" onClick={removeExperiment}>Eliminar</button></div></div>
        <section className="final-result final-result-v2">
          <div className="final-result-top"><span className="experiment-icon xl">{current.emoji}</span><span className="pill pill-done">Experimento terminado</span></div>
          <p className="eyebrow">VEREDICTO</p>
          <h1>{current.title}</h1>
          <p className={`final-verdict ${metrics.tone}`}>{metrics.verdict}.</p>
          <div className="final-metric"><strong>{metrics.delta >= 0 ? "+" : ""}{metrics.delta.toFixed(0)}%</strong><span>en {current.metricLabel.toLowerCase()}</span></div>
          <div className="comparison final-comparison"><div><small>Antes</small><strong>{current.baseline.toFixed(1)}{current.metricUnit}</strong></div><span>→</span><div><small>Durante</small><strong>{metrics.average.toFixed(1)}{current.metricUnit}</strong></div></div>
          <div className="result-kpis"><span><small>CHECK-INS</small><strong>{current.entries.length}</strong></span><span><small>COBERTURA</small><strong>{Math.round(progressData.coverage * 100)}%</strong></span><span><small>CUMPLIMIENTO</small><strong>{Math.round(progressData.adherence * 100)}%</strong></span></div>
          <MetricTrend experiment={current} />
          <p className="final-context">Resultado autodeclarado basado en tus propios registros; no pretende ser evidencia científica.</p>
          <div className="final-actions"><button className="button button-primary" type="button" onClick={shareResult}>{shareState}</button><button className="button button-accent" type="button" onClick={repeatExperiment}>Repetir experimento</button></div>
        </section>
        <section className="history-card history-card-v2"><div className="section-row"><div><p className="eyebrow">HISTORIAL</p><h2>Los datos detrás del resultado</h2></div></div><div className="entry-list">{[...current.entries].reverse().map((entry) => <div className="entry-row entry-row-v2" key={entry.date}><span>{entry.date}</span><span>{entry.completed ? "✓ Hecho" : "— No"}</span><strong>{entry.value}{current.metricUnit}</strong><span className="entry-note">{entry.note ?? ""}</span></div>)}</div></section>
      </main>
    );
  }

  return (
    <main className="product-page detail-page ui-pass-page">
      <div className="detail-topbar"><Link className="back-link" href="/app">← Mis experimentos</Link><div className="detail-actions">{current.status === "active" && <button type="button" onClick={() => changeStatus("pause")}>Pausar</button>}{current.status === "paused" && <button type="button" onClick={() => changeStatus("resume")}>Reanudar</button>}{(current.status === "active" || current.status === "paused") && <button type="button" onClick={() => changeStatus("archive")}>Archivar</button>}<button type="button" onClick={repeatExperiment}>Duplicar</button><button type="button" className="danger-link" onClick={removeExperiment}>Eliminar</button></div></div>

      <section className="detail-hero detail-hero-v2">
        <div className="detail-title"><span className="experiment-icon xl">{current.emoji}</span><div><small className="category-label">{current.category}</small><h1>{current.title}</h1><p>{current.hypothesis}</p></div></div>
        <div className="detail-progress"><div><strong>Día {day}</strong><span>de {current.durationDays}</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><small>{current.status === "paused" ? "Contador pausado" : current.status === "abandoned" ? "Ficha archivada" : `${progress}% completado`}</small></div>
      </section>

      {current.status === "paused" && <section className="status-banner"><div><small>PAUSA ACTIVA</small><strong>El contador de días está congelado.</strong><span>Puedes reanudar cuando quieras sin perder el progreso anterior.</span></div><button className="button button-accent" type="button" onClick={() => changeStatus("resume")}>Reanudar prueba</button></section>}
      {current.status === "abandoned" && <section className="status-banner archived"><div><small>FICHA ARCHIVADA</small><strong>Este experimento ya no acepta check-ins.</strong><span>Puedes conservarlo como referencia o iniciar una copia limpia.</span></div><button className="button button-accent" type="button" onClick={repeatExperiment}>Repetir experimento</button></section>}

      <div className="detail-grid detail-grid-v2">
        <section className="checkin-card checkin-card-v2">
          <p className="eyebrow">{editingDate ? `EDITANDO ${editingDate}` : "CHECK-IN DE HOY"}</p><h2>{editingDate ? "Corrige este registro" : "¿Cómo ha ido?"}</h2>
          {current.status === "active" ? <form onSubmit={submit}>
            <div className="binary-row"><button type="button" className={completed ? "binary active" : "binary"} onClick={() => setCompleted(true)}>✓ Sí, lo hice</button><button type="button" className={!completed ? "binary active" : "binary"} onClick={() => setCompleted(false)}>No hoy</button></div>
            <label className="range-label"><span>{current.metricLabel}</span><strong>{value}{current.metricUnit}</strong></label>
            <input className="range" type="range" min={current.metricMin} max={current.metricMax} step={0.5} value={value} onChange={(event) => setValue(Number(event.target.value))} />
            <div className="range-scale"><span>{current.metricMin}</span><span>{current.metricMax}</span></div>
            <label><span>Nota opcional</span><textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="¿Algo que pueda explicar el resultado?" /></label>
            <div className="checkin-actions">{editingDate && <button className="button button-secondary" type="button" onClick={() => { setEditingDate(null); syncForm(current); }}>Cancelar</button>}<button className="button button-primary" type="submit">{saved ? "✓ Guardado" : editingDate ? "Guardar cambios" : "Guardar check-in"}</button></div>
          </form> : <div className="checkin-locked"><span>⏸</span><p>{current.status === "paused" ? "Reanuda el experimento para registrar nuevos check-ins." : "Esta ficha está archivada. Repite el experimento si quieres volver a probarlo."}</p></div>}
        </section>

        <section className="result-card result-card-v2">
          <div><p className="eyebrow">SEÑAL HASTA AHORA</p><div className="result-number"><strong>{metrics.delta >= 0 ? "+" : ""}{metrics.delta.toFixed(0)}%</strong><span>vs. tu punto de partida</span></div></div>
          <div className="comparison"><div><small>Antes</small><strong>{current.baseline.toFixed(1)}{current.metricUnit}</strong></div><span>→</span><div><small>Durante</small><strong>{metrics.average.toFixed(1)}{current.metricUnit}</strong></div></div>
          <div className="result-kpis"><span><small>COBERTURA</small><strong>{Math.round(progressData.coverage * 100)}%</strong></span><span><small>CUMPLIMIENTO</small><strong>{Math.round(progressData.adherence * 100)}%</strong></span><span><small>CHECK-INS</small><strong>{current.entries.length}</strong></span></div>
          <MetricTrend experiment={current} />
          <p className="result-note">{metrics.done < 3 ? "Aún hay pocos datos. Con 3 check-ins completados podrás obtener un primer veredicto." : metrics.delta > 8 ? "La señal es positiva. Puedes seguir hasta el final o cerrar la prueba cuando ya tengas suficiente información." : metrics.delta < -8 ? "Por ahora el cambio no está mejorando esta métrica." : "Por ahora el cambio parece tener poco efecto sobre esta métrica."}</p>
          {current.status === "active" && <button className="button button-secondary full finish-button" type="button" disabled={metrics.done < 3} onClick={finishExperiment}>{metrics.done < 3 ? `Necesitas ${3 - metrics.done} check-in${3 - metrics.done === 1 ? "" : "s"} más` : "Finalizar y ver veredicto →"}</button>}
        </section>
      </div>

      <section className="history-card history-card-v2"><div className="section-row"><div><p className="eyebrow">HISTORIAL</p><h2>Lo que has registrado</h2></div></div>{current.entries.length ? <div className="entry-list">{[...current.entries].sort((a, b) => b.date.localeCompare(a.date)).map((entry) => <div className="entry-row entry-row-v2 editable" key={entry.date}><span>{entry.date}</span><span>{entry.completed ? "✓ Hecho" : "— No"}</span><strong>{entry.value}{current.metricUnit}</strong><span className="entry-note">{entry.note ?? ""}</span>{current.status === "active" && <span className="entry-actions"><button type="button" onClick={() => startEdit(entry)}>Editar</button><button type="button" onClick={() => removeEntry(entry.date)}>Borrar</button></span>}</div>)}</div> : <p className="muted">Tu primer check-in aparecerá aquí.</p>}</section>
    </main>
  );
}
