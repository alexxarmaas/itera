"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import MetricTrend from "@/components/metric-trend";
import ExperimentCalendar from "@/components/experiment-calendar";
import { archiveExperiment, deleteExperiment, duplicateExperiment, getExperiment, pauseExperiment, removeExperimentEntry, resumeExperiment, saveExperiment, todayKey } from "@/lib/storage";
import { baselineIntegrity, baselineProgress, canFinishExperiment, currentABVariant, effectiveExperimentDay, experimentMetrics, experimentProgress } from "@/lib/results";
import { Experiment, ExperimentDecision, ExperimentEntry, ExperimentPhase, ExperimentVariant } from "@/lib/types";

function sameEntry(a: ExperimentEntry, b: ExperimentEntry) {
  return a.date === b.date && (a.phase ?? "test") === (b.phase ?? "test") && (a.variant ?? "") === (b.variant ?? "");
}

export default function ExperimentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [value, setValue] = useState(7);
  const [completed, setCompleted] = useState(true);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingPhase, setEditingPhase] = useState<ExperimentPhase | undefined>();
  const [editingVariant, setEditingVariant] = useState<ExperimentVariant | undefined>();
  const [shareState, setShareState] = useState("Compartir resultado");
  const [decisionNote, setDecisionNote] = useState("");

  function syncForm(found: Experiment) {
    const currentPhase = found.phase ?? "test";
    const currentVariant = (found.mode ?? "single") === "ab" ? currentABVariant(found) : undefined;
    const today = found.entries.find((entry) => entry.date === todayKey() && (entry.phase ?? "test") === currentPhase && (!currentVariant || entry.variant === currentVariant));
    if (today) { setValue(today.value); setCompleted(today.completed); setNote(today.note ?? ""); }
    else { setValue(Math.round(found.baseline)); setCompleted(true); setNote(""); }
  }

  function clearEditing(found: Experiment) {
    setEditingDate(null);
    setEditingPhase(undefined);
    setEditingVariant(undefined);
    syncForm(found);
  }

  useEffect(() => {
    const found = getExperiment(params.id);
    setExperiment(found ?? null);
    if (found) { syncForm(found); setDecisionNote(found.decisionNote ?? ""); }
  }, [params.id]);

  if (!experiment) return <main className="product-page"><div className="empty-state"><span>🧪</span><h2>No encontramos este experimento.</h2><Link className="button button-primary" href="/app">Volver al inicio</Link></div></main>;

  const current = experiment;
  const mode = current.mode ?? "single";
  const phase = current.phase ?? "test";
  const metrics = experimentMetrics(current);
  const progressData = experimentProgress(current);
  const baseProgress = baselineProgress(current);
  const baseIntegrity = baselineIntegrity(current);
  const day = effectiveExperimentDay(current);
  const progress = Math.round(progressData.progress * 100);
  const variant = mode === "ab" ? currentABVariant(current) : undefined;
  const waitingForTest = phase === "test" && current.startDate > todayKey();
  const canFinish = canFinishExperiment(current);
  const baselineMode = phase === "baseline";
  const editingBaseline = editingPhase === "baseline";
  const formBaseline = baselineMode || editingBaseline;
  const baselineIssue = mode === "single" && phase === "test" && baseProgress.required > 0 && !baseIntegrity.valid;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (current.status !== "active") return;

    const targetPhase = editingPhase ?? phase;
    if (targetPhase === "baseline") {
      const entry: ExperimentEntry = {
        date: editingDate ?? todayKey(),
        completed: true,
        value,
        note: note.trim() || undefined,
        phase: "baseline",
      };
      const exists = current.entries.some((item) => sameEntry(item, entry));
      const nextEntries = exists ? current.entries.map((item) => sameEntry(item, entry) ? entry : item) : [...current.entries, entry];
      const next = saveExperiment({ ...current, entries: nextEntries });
      setExperiment(next);
      clearEditing(next);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
      return;
    }

    if (waitingForTest && !editingDate) return;
    const date = editingDate ?? todayKey();
    const entryVariant = mode === "ab" ? (editingVariant ?? variant) : undefined;
    const entry: ExperimentEntry = { date, completed, value, note: note.trim() || undefined, phase: "test", variant: entryVariant };
    const exists = current.entries.some((item) => sameEntry(item, entry));
    const nextEntries = exists ? current.entries.map((item) => sameEntry(item, entry) ? entry : item) : [...current.entries, entry];
    const next = saveExperiment({ ...current, entries: nextEntries });
    setExperiment(next);
    clearEditing(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function startEdit(entry: ExperimentEntry) {
    if (current.status !== "active") return;
    setEditingDate(entry.date);
    setEditingPhase(entry.phase ?? "test");
    setEditingVariant(entry.variant);
    setValue(entry.value);
    setCompleted(entry.completed);
    setNote(entry.note ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeEntry(entry: ExperimentEntry) {
    if (!window.confirm("¿Eliminar este registro?")) return;
    const result = removeExperimentEntry(current.id, entry);
    if (result.blocked) {
      window.alert(result.reason);
      return;
    }
    if (!result.experiment) return;
    setExperiment(result.experiment);
    if (editingDate === entry.date && editingPhase === (entry.phase ?? "test") && editingVariant === entry.variant) clearEditing(result.experiment);
  }

  function finishExperiment() {
    if (!canFinish || current.status !== "active" || phase !== "test") return;
    const next = saveExperiment({ ...current, status: "completed", completedDate: todayKey() });
    setExperiment(next);
  }

  function saveDecision(decision: ExperimentDecision) {
    const next = saveExperiment({ ...current, decision, decisionNote: decisionNote.trim() || undefined });
    setExperiment(next);
  }

  function changeStatus(action: "pause" | "resume" | "archive") {
    const next = action === "pause" ? pauseExperiment(current.id) : action === "resume" ? resumeExperiment(current.id) : archiveExperiment(current.id);
    if (next) setExperiment(next);
  }

  function repeatExperiment() { const next = duplicateExperiment(current.id); if (next) router.push(`/app/experiments/${next.id}`); }
  function removeExperiment() { if (!window.confirm("¿Eliminar esta ficha y todos sus registros? Esta acción no se puede deshacer.")) return; deleteExperiment(current.id); router.push("/app"); }

  function shareUrl() {
    const query = new URLSearchParams({ title: current.title, emoji: current.emoji, category: current.category, metric: current.metricLabel, unit: current.metricUnit, baseline: current.baseline.toFixed(1), average: metrics.average.toFixed(1), delta: metrics.delta.toFixed(0), days: String(Math.max(1, day)), duration: String(current.durationDays), hypothesis: current.hypothesis, checks: String(metrics.done), mode });
    if (mode === "ab") { query.set("variantA", current.variantA ?? "A"); query.set("variantB", current.variantB ?? "B"); query.set("aAverage", metrics.aAverage.toFixed(1)); query.set("bAverage", metrics.bAverage.toFixed(1)); if (metrics.winner) query.set("winner", metrics.winner); }
    return `${window.location.origin}/share?${query.toString()}`;
  }

  async function shareResult() {
    const url = shareUrl();
    const text = mode === "ab" ? `${current.emoji} Comparé “${current.title}” en Itera. ${metrics.verdict}.` : `${current.emoji} Probé “${current.title}” en Itera. ${metrics.verdict}. ${metrics.delta >= 0 ? "+" : ""}${metrics.delta.toFixed(0)}% en ${current.metricLabel.toLowerCase()}.`;
    try { if (navigator.share) { await navigator.share({ title: "Mi resultado en Itera", text, url }); return; } await navigator.clipboard.writeText(`${text}\n${url}`); setShareState("✓ Enlace copiado"); window.setTimeout(() => setShareState("Compartir resultado"), 1800); }
    catch { setShareState("Copia el enlace"); window.prompt("Copia este enlace para compartir tu resultado", url); }
  }

  if (current.status === "completed") {
    return (
      <main className="product-page detail-page ui-pass-page method-detail-page">
        <div className="detail-topbar"><Link className="back-link" href="/app">← Mis experimentos</Link><div className="detail-actions"><button type="button" onClick={repeatExperiment}>Repetir</button><button type="button" className="danger-link" onClick={removeExperiment}>Eliminar</button></div></div>
        <section className="final-result final-result-v2 method-final-result">
          <div className="final-result-top"><span className="experiment-icon xl">{current.emoji}</span><span className="pill pill-done">{mode === "ab" ? "Comparación terminada" : "Experimento terminado"}</span></div>
          <p className="eyebrow">VEREDICTO · EVIDENCIA {metrics.evidence.toUpperCase()}</p><h1>{current.title}</h1><p className={`final-verdict ${metrics.tone}`}>{metrics.verdict}.</p>
          {mode === "ab" ? <div className="ab-result-comparison"><div className={metrics.winner === "A" ? "winner" : ""}><small>A · {current.variantA}</small><strong>{metrics.aAverage.toFixed(1)}{current.metricUnit}</strong><span>{metrics.aCount} registros</span></div><i>VS</i><div className={metrics.winner === "B" ? "winner" : ""}><small>B · {current.variantB}</small><strong>{metrics.bAverage.toFixed(1)}{current.metricUnit}</strong><span>{metrics.bCount} registros</span></div></div> : <><div className="final-metric"><strong>{metrics.delta >= 0 ? "+" : ""}{metrics.delta.toFixed(0)}%</strong><span>en {current.metricLabel.toLowerCase()}</span></div><div className="comparison final-comparison"><div><small>Baseline</small><strong>{current.baseline.toFixed(1)}{current.metricUnit}</strong></div><span>→</span><div><small>Durante</small><strong>{metrics.average.toFixed(1)}{current.metricUnit}</strong></div></div></>}
          <div className="result-kpis"><span><small>CHECK-INS</small><strong>{metrics.done}</strong></span><span><small>COBERTURA</small><strong>{Math.round(progressData.coverage * 100)}%</strong></span><span><small>EVIDENCIA</small><strong>{metrics.evidence}</strong></span></div>
          <MetricTrend experiment={current} /><p className="final-context">Resultado autodeclarado basado en tus propios registros; no pretende ser evidencia científica.</p>
          <div className="final-actions"><button className="button button-primary" type="button" onClick={shareResult}>{shareState}</button><button className="button button-secondary" type="button" onClick={repeatExperiment}>Repetir experimento</button></div>
        </section>

        <section className="decision-panel"><div><p className="eyebrow">CIERRA EL CICLO</p><h2>¿Qué haces con lo aprendido?</h2><p>Esta decisión alimentará tu Manual Personal.</p></div><textarea value={decisionNote} onChange={(event) => setDecisionNote(event.target.value)} rows={2} placeholder="Nota opcional: qué aprendiste, qué cambiarías..." /><div className="decision-grid"><button className={current.decision === "keep" ? "active" : ""} onClick={() => saveDecision("keep")}><b>✓</b><strong>Me lo quedo</strong><span>Quiero mantener este cambio.</span></button><button className={current.decision === "discard" ? "active" : ""} onClick={() => saveDecision("discard")}><b>×</b><strong>Lo descarto</strong><span>No me compensa.</span></button><button className={current.decision === "repeat" ? "active" : ""} onClick={() => saveDecision("repeat")}><b>↻</b><strong>Repetir</strong><span>Necesito más evidencia.</span></button><button className={current.decision === "variant" ? "active" : ""} onClick={() => saveDecision("variant")}><b>≈</b><strong>Probar variante</strong><span>Cambiaré una condición.</span></button></div>{current.decision && <Link className="manual-jump" href="/app/manual">Ver en mi Manual Personal →</Link>}</section>

        <ExperimentCalendar experiment={current} />
        <section className="history-card history-card-v2"><div className="section-row"><div><p className="eyebrow">HISTORIAL</p><h2>Los datos detrás del resultado</h2></div></div><div className="entry-list">{[...current.entries].sort((a,b) => b.date.localeCompare(a.date)).map((entry, index) => <div className="entry-row entry-row-v2" key={`${entry.date}-${entry.variant ?? entry.phase}-${index}`}><span>{entry.date}</span><span>{entry.phase === "baseline" ? "BASELINE" : entry.variant ? `${entry.variant} · ${entry.completed ? "✓" : "—"}` : entry.completed ? "✓ Hecho" : "— No"}</span><strong>{entry.value}{current.metricUnit}</strong><span className="entry-note">{entry.note ?? ""}</span></div>)}</div></section>
      </main>
    );
  }

  return (
    <main className="product-page detail-page ui-pass-page method-detail-page">
      <div className="detail-topbar"><Link className="back-link" href="/app">← Mis experimentos</Link><div className="detail-actions">{current.status === "active" && <button type="button" onClick={() => changeStatus("pause")}>Pausar</button>}{current.status === "paused" && <button type="button" onClick={() => changeStatus("resume")}>Reanudar</button>}{(current.status === "active" || current.status === "paused") && <button type="button" onClick={() => changeStatus("archive")}>Archivar</button>}<button type="button" onClick={repeatExperiment}>Duplicar</button><button type="button" className="danger-link" onClick={removeExperiment}>Eliminar</button></div></div>

      <section className="detail-hero detail-hero-v2"><div className="detail-title"><span className="experiment-icon xl">{current.emoji}</span><div><small className="category-label">{current.category} · {mode === "ab" ? "A/B" : baselineMode ? "BASELINE" : "PRUEBA"}</small><h1>{current.title}</h1><p>{current.hypothesis}</p></div></div><div className="detail-progress">{baselineMode ? <><div><strong>{baseProgress.done}/{baseProgress.required}</strong><span>observaciones</span></div><div className="progress-track"><span style={{ width: `${Math.min(100, Math.round((baseProgress.done / Math.max(1, baseProgress.required)) * 100))}%` }} /></div><small>Midiendo punto de partida</small></> : <><div><strong>{day === 0 ? "—" : `Día ${day}`}</strong><span>de {current.durationDays}</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><small>{waitingForTest ? "La prueba empieza mañana" : current.status === "paused" ? "Contador pausado" : current.status === "abandoned" ? "Ficha archivada" : `${progress}% completado`}</small></>}</div></section>

      {baselineMode && current.status === "active" && <section className="status-banner baseline-banner"><div><small>FASE 0 · BASELINE</small><strong>No cambies nada todavía.</strong><span>Durante {current.baselineDays} días registra {current.metricLabel.toLowerCase()} como lo harías normalmente. Después Itera calculará tu punto de partida real.</span></div><span className="baseline-live">{baseProgress.average.toFixed(1)}{current.metricUnit}<small>media provisional</small></span></section>}
      {waitingForTest && current.status === "active" && !baselineIssue && <section className="status-banner baseline-ready"><div><small>BASELINE COMPLETO</small><strong>Tu punto de partida es {current.baseline.toFixed(1)}{current.metricUnit}.</strong><span>Mañana empieza la intervención. Hoy ya has terminado.</span></div><span className="baseline-live">✓<small>listo</small></span></section>}
      {baselineIssue && <section className="status-banner archived"><div><small>BASELINE INCOMPLETO</small><strong>Faltan observaciones para validar el punto de partida.</strong><span>Itera ha bloqueado el veredicto hasta que el baseline vuelva a estar completo. Corrige los registros del historial antes de continuar.</span></div></section>}
      {mode === "ab" && !waitingForTest && current.status === "active" && <section className="ab-today-banner"><small>CONDICIÓN DE HOY</small><b>{variant}</b><strong>{variant === "A" ? current.variantA : current.variantB}</strong><span>Mañana cambiarás automáticamente a la otra condición.</span></section>}
      {current.status === "paused" && <section className="status-banner"><div><small>PAUSA ACTIVA</small><strong>El contador está congelado.</strong><span>Puedes reanudar sin perder el progreso anterior.</span></div><button className="button button-accent" type="button" onClick={() => changeStatus("resume")}>Reanudar prueba</button></section>}
      {current.status === "abandoned" && <section className="status-banner archived"><div><small>FICHA ARCHIVADA</small><strong>Este experimento ya no acepta registros.</strong><span>Puedes conservarlo como referencia o iniciar una copia limpia.</span></div><button className="button button-accent" type="button" onClick={repeatExperiment}>Repetir experimento</button></section>}

      <div className="detail-grid detail-grid-v2">
        <section className="checkin-card checkin-card-v2">
          <p className="eyebrow">{editingDate ? `${editingBaseline ? "EDITANDO BASELINE" : "EDITANDO"} · ${editingDate}` : baselineMode ? "OBSERVACIÓN DE HOY" : "CHECK-IN DE HOY"}</p><h2>{editingDate ? "Corrige este registro" : baselineMode ? "¿Cómo estás hoy?" : "¿Cómo ha ido?"}</h2>
          {current.status === "active" && (!waitingForTest || Boolean(editingDate)) ? <form onSubmit={submit}>
            {!formBaseline && <div className="binary-row"><button type="button" className={completed ? "binary active" : "binary"} onClick={() => setCompleted(true)}>{mode === "ab" ? `✓ Sí, respeté ${editingVariant ?? variant}` : "✓ Sí, lo hice"}</button><button type="button" className={!completed ? "binary active" : "binary"} onClick={() => setCompleted(false)}>No hoy</button></div>}
            {formBaseline && <p className="baseline-instruction">{editingBaseline && !baselineMode ? "Estás corrigiendo una observación del baseline. Al guardar, Itera recalculará automáticamente el punto de partida y todos los resultados dependientes." : "Registra la señal sin aplicar todavía el cambio que quieres probar."}</p>}
            <label className="range-label"><span>{current.metricLabel}</span><strong>{value}{current.metricUnit}</strong></label><input className="range" type="range" min={current.metricMin} max={current.metricMax} step={0.5} value={value} onChange={(event) => setValue(Number(event.target.value))} /><div className="range-scale"><span>{current.metricMin}</span><span>{current.metricMax}</span></div>
            <label><span>Nota opcional</span><textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="¿Algo que pueda explicar el resultado?" /></label>
            <div className="checkin-actions">{editingDate && <button className="button button-secondary" type="button" onClick={() => clearEditing(current)}>Cancelar</button>}<button className="button button-primary" type="submit">{saved ? "✓ Guardado" : editingDate ? "Guardar cambios" : baselineMode ? "Guardar observación" : "Guardar check-in"}</button></div>
          </form> : <div className="checkin-locked"><span>{waitingForTest ? "✓" : "⏸"}</span><p>{waitingForTest ? "Baseline terminado. Vuelve mañana para empezar la prueba." : current.status === "paused" ? "Reanuda el experimento para registrar nuevos check-ins." : "Esta ficha está archivada. Repite el experimento si quieres volver a probarlo."}</p></div>}
        </section>

        <section className="result-card result-card-v2 method-readout-card">
          {baselineMode ? <><div><p className="eyebrow">BASELINE PROVISIONAL</p><div className="result-number"><strong>{baseProgress.average.toFixed(1)}</strong><span>{current.metricLabel.toLowerCase()} · {baseProgress.done}/{baseProgress.required} observaciones</span></div></div><p className="result-note">Itera utilizará la media de tus observaciones como punto de partida. Así no dependes solo de recordar “más o menos cómo estabas”.</p></> : mode === "ab" ? <><div><p className="eyebrow">COMPARACIÓN HASTA AHORA</p></div><div className="ab-live-comparison"><span><small>A · {current.variantA}</small><strong>{metrics.aCount ? metrics.aAverage.toFixed(1) : "—"}{current.metricUnit}</strong><em>{metrics.aCount} registros</em></span><i>VS</i><span><small>B · {current.variantB}</small><strong>{metrics.bCount ? metrics.bAverage.toFixed(1) : "—"}{current.metricUnit}</strong><em>{metrics.bCount} registros</em></span></div><div className="evidence-chip">EVIDENCIA · {metrics.evidence.toUpperCase()}</div><MetricTrend experiment={current} /><p className="result-note">{metrics.verdict}. Necesitas al menos 2 registros válidos de cada condición para cerrar la comparación.</p>{current.status === "active" && <button className="button button-secondary full finish-button" type="button" disabled={!canFinish} onClick={finishExperiment}>{canFinish ? "Finalizar comparación →" : `A ${metrics.aCount}/2 · B ${metrics.bCount}/2`}</button>}</> : <><div><p className="eyebrow">SEÑAL HASTA AHORA</p><div className="result-number"><strong>{metrics.delta >= 0 ? "+" : ""}{metrics.delta.toFixed(0)}%</strong><span>vs. tu baseline de {current.baseline.toFixed(1)}{current.metricUnit}</span></div></div><div className="comparison"><div><small>Baseline</small><strong>{current.baseline.toFixed(1)}{current.metricUnit}</strong></div><span>→</span><div><small>Durante</small><strong>{metrics.average.toFixed(1)}{current.metricUnit}</strong></div></div><div className="result-kpis"><span><small>COBERTURA</small><strong>{Math.round(progressData.coverage * 100)}%</strong></span><span><small>CUMPLIMIENTO</small><strong>{Math.round(progressData.adherence * 100)}%</strong></span><span><small>EVIDENCIA</small><strong>{metrics.evidence}</strong></span></div><MetricTrend experiment={current} /><p className="result-note">{metrics.done < 3 ? "Aún hay pocos datos. Con 3 check-ins completados podrás obtener un primer veredicto." : metrics.verdict}.</p>{current.status === "active" && <button className="button button-secondary full finish-button" type="button" disabled={!canFinish} onClick={finishExperiment}>{canFinish ? "Finalizar y ver veredicto →" : baselineIssue ? "Completa el baseline antes de cerrar" : `Necesitas ${Math.max(0, 3 - metrics.done)} check-ins más`}</button>}</>}
        </section>
      </div>

      <ExperimentCalendar experiment={current} />
      <section className="history-card history-card-v2"><div className="section-row"><div><p className="eyebrow">HISTORIAL</p><h2>Lo que has registrado</h2></div></div>{current.entries.length ? <div className="entry-list">{[...current.entries].sort((a,b) => b.date.localeCompare(a.date)).map((entry, index) => <div className="entry-row entry-row-v2 editable" key={`${entry.date}-${entry.variant ?? entry.phase}-${index}`}><span>{entry.date}</span><span>{entry.phase === "baseline" ? "BASELINE" : entry.variant ? `${entry.variant} · ${entry.completed ? "✓" : "—"}` : entry.completed ? "✓ Hecho" : "— No"}</span><strong>{entry.value}{current.metricUnit}</strong><span className="entry-note">{entry.note ?? ""}</span>{current.status === "active" && <span className="entry-actions"><button type="button" onClick={() => startEdit(entry)}>Editar</button><button type="button" onClick={() => removeEntry(entry)}>{entry.phase === "baseline" && !baselineMode ? "Borrar" : "Borrar"}</button></span>}</div>)}</div> : <p className="muted">Tu primer registro aparecerá aquí.</p>}</section>
    </main>
  );
}
