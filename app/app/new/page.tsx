"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveExperiment } from "@/lib/storage";
import { Experiment } from "@/lib/types";

const categories = ["Productividad", "Sueño", "Energía", "Vida digital", "Dinero", "Estudio", "Otro"];

export default function NewExperimentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Productividad");
  const [duration, setDuration] = useState(7);
  const [metric, setMetric] = useState("Productividad");
  const [baseline, setBaseline] = useState(6);
  const [hypothesis, setHypothesis] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedTitle = params.get("title");
    const sharedCategory = params.get("category");
    const sharedMetric = params.get("metric");
    const sharedDuration = Number(params.get("duration"));
    const sharedBaseline = Number(params.get("baseline"));
    const sharedHypothesis = params.get("hypothesis");
    if (sharedTitle) setTitle(sharedTitle);
    if (sharedCategory && categories.includes(sharedCategory)) setCategory(sharedCategory);
    if (sharedMetric) setMetric(sharedMetric);
    if ([7, 10, 14, 21, 30].includes(sharedDuration)) setDuration(sharedDuration);
    if (Number.isFinite(sharedBaseline) && sharedBaseline >= 1 && sharedBaseline <= 10) setBaseline(sharedBaseline);
    if (sharedHypothesis) setHypothesis(sharedHypothesis);
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    if (step === 1) {
      setStep(2);
      return;
    }

    const experiment: Experiment = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      emoji: category === "Sueño" ? "🌙" : category === "Dinero" ? "💸" : category === "Energía" ? "⚡" : category === "Vida digital" ? "📵" : category === "Estudio" ? "📚" : "🧪",
      category,
      description: hypothesis.trim() || `Experimento personal de ${duration} días.`,
      durationDays: duration,
      startDate: new Date().toISOString().slice(0, 10),
      status: "active",
      hypothesis: hypothesis.trim() || "Quiero comprobar si este cambio me funciona.",
      metricLabel: metric.trim() || "Resultado",
      metricMin: 1,
      metricMax: 10,
      metricUnit: "/10",
      baseline,
      entries: [],
    };
    saveExperiment(experiment);
    router.push(`/app/experiments/${experiment.id}`);
  }

  return (
    <main className="product-page narrow-page">
      <header className="product-header"><div><p className="eyebrow">NUEVO EXPERIMENTO</p><h1>{step === 1 ? "¿Qué quieres poner a prueba?" : "¿Cómo sabrás si funciona?"}</h1><p>{step === 1 ? "Define un cambio pequeño y cuánto tiempo vas a probarlo." : "Elige una sola señal. No hace falta medirlo todo."}</p></div></header>
      <div className="wizard-progress" aria-label={`Paso ${step} de 2`}><span className="active" /><span className={step === 2 ? "active" : ""} /></div>
      <form className="experiment-form" onSubmit={submit}>
        {step === 1 ? <>
          <label><span>¿Qué quieres probar?</span><input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Trabajar sin música" /></label>
          <div className="form-grid"><label><span>Categoría</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Duración</span><select value={duration} onChange={(event) => setDuration(Number(event.target.value))}><option value={7}>7 días</option><option value={10}>10 días</option><option value={14}>14 días</option><option value={21}>21 días</option><option value={30}>30 días</option></select></label></div>
          <div className="form-preview"><small>Tu prueba</small><strong>{title || "Un cambio concreto"}</strong><span>{duration} días · {category}</span></div>
          <button className="button button-primary full" type="submit">Continuar →</button>
        </> : <>
          <div className="form-preview"><small>Vas a probar</small><strong>{title}</strong><span>{duration} días · {category}</span></div>
          <div className="form-grid"><label><span>¿Qué vas a medir?</span><input autoFocus value={metric} onChange={(event) => setMetric(event.target.value)} placeholder="Concentración" /></label><label><span>¿Cómo estás ahora? · 1–10</span><input type="number" min={1} max={10} value={baseline} onChange={(event) => setBaseline(Math.min(10, Math.max(1, Number(event.target.value) || 1)))} /></label></div>
          <label><span>¿Qué crees que pasará? <em>opcional</em></span><textarea value={hypothesis} onChange={(event) => setHypothesis(event.target.value)} placeholder="Creo que me concentraré mejor y terminaré antes." rows={3} /></label>
          <div className="step-actions"><button className="button button-secondary" type="button" onClick={() => setStep(1)}>← Atrás</button><button className="button button-primary" type="submit">Empezar experimento →</button></div>
        </>}
      </form>
      <p className="privacy-note">Tus datos se guardan por ahora únicamente en este dispositivo.</p>
    </main>
  );
}
