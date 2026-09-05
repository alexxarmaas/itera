"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveExperiment } from "@/lib/storage";
import { Experiment } from "@/lib/types";

const categories = ["Productividad", "Sueño", "Energía", "Vida digital", "Dinero", "Estudio", "Otro"];

export default function NewExperimentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Productividad");
  const [duration, setDuration] = useState(7);
  const [metric, setMetric] = useState("Productividad");
  const [baseline, setBaseline] = useState(6);
  const [hypothesis, setHypothesis] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
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
      <header className="product-header"><div><p className="eyebrow">NUEVO EXPERIMENTO</p><h1>Convierte una pregunta en una prueba.</h1><p>No hace falta que sea perfecto. Solo que sea concreto y medible.</p></div></header>
      <form className="experiment-form" onSubmit={submit}>
        <label><span>¿Qué quieres probar?</span><input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Trabajar sin música" /></label>
        <div className="form-grid"><label><span>Categoría</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Duración</span><select value={duration} onChange={(event) => setDuration(Number(event.target.value))}><option value={7}>7 días</option><option value={10}>10 días</option><option value={14}>14 días</option><option value={21}>21 días</option><option value={30}>30 días</option></select></label></div>
        <label><span>¿Qué crees que pasará?</span><textarea value={hypothesis} onChange={(event) => setHypothesis(event.target.value)} placeholder="Creo que me concentraré mejor y terminaré antes." rows={3} /></label>
        <div className="form-grid"><label><span>¿Qué vas a medir?</span><input value={metric} onChange={(event) => setMetric(event.target.value)} placeholder="Concentración" /></label><label><span>¿Cómo estás ahora? · 1–10</span><input type="number" min={1} max={10} value={baseline} onChange={(event) => setBaseline(Number(event.target.value))} /></label></div>
        <div className="form-preview"><small>Tu experimento</small><strong>{title || "Tu cambio"}</strong><span>{duration} días · {metric || "Una métrica"} · punto de partida {baseline}/10</span></div>
        <button className="button button-primary full" type="submit">Empezar experimento →</button>
      </form>
    </main>
  );
}
