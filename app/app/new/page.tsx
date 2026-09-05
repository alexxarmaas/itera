"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveExperiment } from "@/lib/storage";
import { Experiment, ExperimentMode } from "@/lib/types";

const categories = ["Productividad", "Sueño", "Energía", "Vida digital", "Dinero", "Estudio", "Otro"];

export default function NewExperimentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<ExperimentMode>("single");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Productividad");
  const [duration, setDuration] = useState(7);
  const [metric, setMetric] = useState("Productividad");
  const [baseline, setBaseline] = useState(6);
  const [useRealBaseline, setUseRealBaseline] = useState(true);
  const [hypothesis, setHypothesis] = useState("");
  const [variantA, setVariantA] = useState("Opción A");
  const [variantB, setVariantB] = useState("Opción B");

  const durations = useMemo(() => mode === "ab" ? [8, 14, 20, 30] : [7, 10, 14, 21, 30], [mode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedMode = params.get("mode");
    const sharedTitle = params.get("title");
    const sharedCategory = params.get("category");
    const sharedMetric = params.get("metric");
    const sharedDuration = Number(params.get("duration"));
    const sharedHypothesis = params.get("hypothesis");
    const sharedA = params.get("variantA");
    const sharedB = params.get("variantB");
    if (sharedMode === "ab") setMode("ab");
    if (sharedTitle) setTitle(sharedTitle);
    if (sharedCategory && categories.includes(sharedCategory)) setCategory(sharedCategory);
    if (sharedMetric) setMetric(sharedMetric);
    if (Number.isFinite(sharedDuration) && sharedDuration > 0) setDuration(sharedDuration);
    if (sharedHypothesis) setHypothesis(sharedHypothesis);
    if (sharedA) setVariantA(sharedA);
    if (sharedB) setVariantB(sharedB);
  }, []);

  useEffect(() => {
    if (!durations.includes(duration)) setDuration(durations[0]);
  }, [mode, duration, durations]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    if (step === 1) { setStep(2); return; }

    const baselineDays = mode === "single" && useRealBaseline ? 2 : 0;
    const experiment: Experiment = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      emoji: category === "Sueño" ? "🌙" : category === "Dinero" ? "💸" : category === "Energía" ? "⚡" : category === "Vida digital" ? "📵" : category === "Estudio" ? "📚" : mode === "ab" ? "⚖️" : "🧪",
      category,
      description: hypothesis.trim() || `Experimento personal de ${duration} días.`,
      durationDays: duration,
      startDate: new Date().toISOString().slice(0, 10),
      status: "active",
      mode,
      phase: baselineDays > 0 ? "baseline" : "test",
      baselineDays,
      hypothesis: hypothesis.trim() || (mode === "ab" ? `Quiero descubrir si ${variantA} funciona mejor que ${variantB}.` : "Quiero comprobar si este cambio me funciona."),
      metricLabel: metric.trim() || "Resultado",
      metricMin: 1,
      metricMax: 10,
      metricUnit: "/10",
      baseline,
      variantA: mode === "ab" ? variantA.trim() || "Opción A" : undefined,
      variantB: mode === "ab" ? variantB.trim() || "Opción B" : undefined,
      entries: [],
      pausedDays: 0,
    };
    saveExperiment(experiment);
    router.push(`/app/experiments/${experiment.id}`);
  }

  return (
    <main className="product-page narrow-page method-new-page">
      <header className="product-header"><div><p className="eyebrow">NUEVA PRUEBA</p><h1>{step === 1 ? "¿Qué quieres descubrir?" : mode === "ab" ? "Define las dos condiciones" : "Define cómo vas a medirlo"}</h1><p>{step === 1 ? "Una prueba simple o una comparación A/B. Tú eliges el método." : mode === "ab" ? "Itera alternará A y B para compararlas con la misma señal." : "Puedes medir primero tu punto de partida para tener una comparación más fiable."}</p></div></header>
      <div className="wizard-progress" aria-label={`Paso ${step} de 2`}><span className="active" /><span className={step === 2 ? "active" : ""} /></div>
      <form className="experiment-form" onSubmit={submit}>
        {step === 1 ? <>
          <div className="mode-picker">
            <button type="button" className={mode === "single" ? "mode-option active" : "mode-option"} onClick={() => setMode("single")}><small>CAMBIO ÚNICO</small><strong>Prueba una cosa</strong><span>Baseline → cambio → veredicto</span></button>
            <button type="button" className={mode === "ab" ? "mode-option active" : "mode-option"} onClick={() => setMode("ab")}><small>COMPARACIÓN</small><strong>Modo A/B</strong><span>Alterna dos opciones y compáralas</span></button>
          </div>
          <label><span>Nombre de la prueba</span><input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder={mode === "ab" ? "Ej. Música vs silencio" : "Ej. Trabajar sin música"} /></label>
          <div className="form-grid"><label><span>Categoría</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Duración</span><select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>{durations.map((days) => <option value={days} key={days}>{days} días</option>)}</select></label></div>
          <div className="form-preview"><small>{mode === "ab" ? "COMPARACIÓN A/B" : "PRUEBA SIMPLE"}</small><strong>{title || (mode === "ab" ? "Dos condiciones" : "Un cambio concreto")}</strong><span>{duration} días · {category}</span></div>
          <button className="button button-primary full" type="submit">Continuar →</button>
        </> : <>
          <div className="form-preview"><small>{mode === "ab" ? "Vas a comparar" : "Vas a probar"}</small><strong>{title}</strong><span>{duration} días · {category}</span></div>
          <label><span>¿Qué señal vas a medir?</span><input autoFocus value={metric} onChange={(event) => setMetric(event.target.value)} placeholder="Concentración" /></label>
          {mode === "ab" ? <>
            <div className="form-grid"><label><span>Condición A</span><input value={variantA} onChange={(event) => setVariantA(event.target.value)} placeholder="Música" /></label><label><span>Condición B</span><input value={variantB} onChange={(event) => setVariantB(event.target.value)} placeholder="Silencio" /></label></div>
            <div className="ab-preview"><span><b>A</b>{variantA || "Opción A"}</span><i>↔</i><span><b>B</b>{variantB || "Opción B"}</span></div>
          </> : <>
            <div className="baseline-choice"><button type="button" className={useRealBaseline ? "baseline-option active" : "baseline-option"} onClick={() => setUseRealBaseline(true)}><small>RECOMENDADO</small><strong>Medir baseline real</strong><span>2 días observando tu estado normal antes del cambio.</span></button><button type="button" className={!useRealBaseline ? "baseline-option active" : "baseline-option"} onClick={() => setUseRealBaseline(false)}><strong>Usar valor manual</strong><span>Empieza hoy con una estimación de tu punto de partida.</span></button></div>
            {!useRealBaseline && <label><span>Tu punto de partida · 1–10</span><input type="number" min={1} max={10} value={baseline} onChange={(event) => setBaseline(Math.min(10, Math.max(1, Number(event.target.value) || 1)))} /></label>}
          </>}
          <label><span>Hipótesis <em>opcional</em></span><textarea value={hypothesis} onChange={(event) => setHypothesis(event.target.value)} placeholder={mode === "ab" ? `Creo que ${variantA} me dará mejores resultados.` : "Creo que este cambio mejorará mi concentración."} rows={3} /></label>
          <div className="step-actions"><button className="button button-secondary" type="button" onClick={() => setStep(1)}>← Atrás</button><button className="button button-accent" type="submit">{mode === "single" && useRealBaseline ? "Empezar baseline →" : "Empezar experimento →"}</button></div>
        </>}
      </form>
      <p className="privacy-note">Tus datos se guardan por ahora únicamente en este dispositivo.</p>
    </main>
  );
}
