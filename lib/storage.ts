import { catalog } from "./catalog";
import { Experiment, ExperimentTemplate } from "./types";

const KEY = "itera.experiments.v1";

function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

const seed: Experiment[] = [
  {
    id: "demo-phone",
    title: "Sin móvil después de las 23:00",
    emoji: "🌙",
    category: "Sueño",
    description: "Dejar el móvil antes de dormir y comprobar si descanso mejor.",
    durationDays: 14,
    startDate: isoDate(-7),
    status: "active",
    hypothesis: "Dormiré mejor si dejo de mirar el móvil antes de acostarme.",
    metricLabel: "Calidad del sueño",
    metricMin: 1,
    metricMax: 10,
    metricUnit: "/10",
    baseline: 6.2,
    entries: [
      { date: isoDate(-7), completed: true, value: 6.8 },
      { date: isoDate(-6), completed: true, value: 7.1 },
      { date: isoDate(-5), completed: false, value: 6.0, note: "Salí tarde" },
      { date: isoDate(-4), completed: true, value: 7.4 },
      { date: isoDate(-3), completed: true, value: 7.6 },
      { date: isoDate(-2), completed: true, value: 7.3 },
      { date: isoDate(-1), completed: true, value: 7.8 },
    ],
  },
];

export function loadExperiments(): Experiment[] {
  if (typeof window === "undefined") return seed;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    window.localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as Experiment[];
  } catch {
    return seed;
  }
}

export function saveExperiments(experiments: Experiment[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(experiments));
}

export function getExperiment(id: string) {
  return loadExperiments().find((experiment) => experiment.id === id);
}

export function saveExperiment(experiment: Experiment) {
  const current = loadExperiments();
  const exists = current.some((item) => item.id === experiment.id);
  const next = exists ? current.map((item) => (item.id === experiment.id ? experiment : item)) : [experiment, ...current];
  saveExperiments(next);
  return experiment;
}

export function createFromTemplate(template: ExperimentTemplate) {
  const experiment: Experiment = {
    ...template,
    id: `${template.slug}-${Date.now()}`,
    startDate: isoDate(0),
    status: "active",
    entries: [],
  };
  const { slug: _slug, popularity: _popularity, ...clean } = experiment as Experiment & { slug?: string; popularity?: number };
  return saveExperiment(clean);
}

export function findTemplate(slug: string) {
  return catalog.find((template) => template.slug === slug);
}

export function todayKey() {
  return isoDate(0);
}
