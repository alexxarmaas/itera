import { catalog } from "./catalog";
import { Experiment, ExperimentTemplate } from "./types";

const KEY = "itera.experiments.v1";

function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function dateDiff(start: string, end: string) {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / 86400000));
}

function normalizeExperiment(experiment: Experiment): Experiment {
  const mode = experiment.mode ?? "single";
  const baselineDays = experiment.baselineDays ?? 0;
  return {
    ...experiment,
    mode,
    phase: experiment.phase ?? "test",
    baselineDays,
    pausedDays: experiment.pausedDays ?? 0,
    entries: experiment.entries.map((entry) => ({ ...entry, phase: entry.phase ?? "test" })),
  };
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
    mode: "single",
    phase: "test",
    baselineDays: 0,
    entries: [
      { date: isoDate(-7), completed: true, value: 6.8, phase: "test" },
      { date: isoDate(-6), completed: true, value: 7.1, phase: "test" },
      { date: isoDate(-5), completed: false, value: 6.0, note: "Salí tarde", phase: "test" },
      { date: isoDate(-4), completed: true, value: 7.4, phase: "test" },
      { date: isoDate(-3), completed: true, value: 7.6, phase: "test" },
      { date: isoDate(-2), completed: true, value: 7.3, phase: "test" },
      { date: isoDate(-1), completed: true, value: 7.8, phase: "test" },
    ],
  },
];

export function loadExperiments(): Experiment[] {
  if (typeof window === "undefined") return seed.map(normalizeExperiment);
  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    window.localStorage.setItem(KEY, JSON.stringify(seed));
    return seed.map(normalizeExperiment);
  }
  try {
    return (JSON.parse(raw) as Experiment[]).map(normalizeExperiment);
  } catch {
    return seed.map(normalizeExperiment);
  }
}

export function saveExperiments(experiments: Experiment[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(experiments.map(normalizeExperiment)));
}

export function getExperiment(id: string) {
  return loadExperiments().find((experiment) => experiment.id === id);
}

export function saveExperiment(experiment: Experiment) {
  const normalized = normalizeExperiment(experiment);
  const current = loadExperiments();
  const exists = current.some((item) => item.id === normalized.id);
  const next = exists ? current.map((item) => (item.id === normalized.id ? normalized : item)) : [normalized, ...current];
  saveExperiments(next);
  return normalized;
}

export function deleteExperiment(id: string) {
  saveExperiments(loadExperiments().filter((experiment) => experiment.id !== id));
}

export function pauseExperiment(id: string) {
  const experiment = getExperiment(id);
  if (!experiment || experiment.status !== "active") return experiment;
  return saveExperiment({ ...experiment, status: "paused", pausedAt: todayKey() });
}

export function resumeExperiment(id: string) {
  const experiment = getExperiment(id);
  if (!experiment || experiment.status !== "paused") return experiment;
  const addedPausedDays = experiment.pausedAt ? dateDiff(experiment.pausedAt, todayKey()) : 0;
  return saveExperiment({
    ...experiment,
    status: "active",
    pausedAt: undefined,
    pausedDays: (experiment.pausedDays ?? 0) + addedPausedDays,
  });
}

export function archiveExperiment(id: string) {
  const experiment = getExperiment(id);
  if (!experiment || experiment.status === "completed") return experiment;
  return saveExperiment({ ...experiment, status: "abandoned", abandonedDate: todayKey(), pausedAt: undefined });
}

export function duplicateExperiment(id: string) {
  const experiment = getExperiment(id);
  if (!experiment) return undefined;
  const baselineDays = experiment.mode === "ab" ? 0 : experiment.baselineDays ?? 0;
  const duplicate: Experiment = {
    ...experiment,
    id: `${experiment.id.split("-").slice(0, 2).join("-") || "experiment"}-${Date.now()}`,
    startDate: todayKey(),
    status: "active",
    phase: experiment.mode === "ab" || baselineDays === 0 ? "test" : "baseline",
    entries: [],
    completedDate: undefined,
    abandonedDate: undefined,
    pausedAt: undefined,
    pausedDays: 0,
    baselineCompletedDate: undefined,
    decision: undefined,
    decisionNote: undefined,
  };
  return saveExperiment(duplicate);
}

export function createFromTemplate(template: ExperimentTemplate) {
  const { slug: _slug, ...templateData } = template;
  const baselineDays = template.baselineDays ?? 2;
  const experiment: Experiment = {
    ...templateData,
    id: `${template.slug}-${Date.now()}`,
    startDate: isoDate(0),
    status: "active",
    mode: "single",
    phase: baselineDays > 0 ? "baseline" : "test",
    baselineDays,
    entries: [],
    pausedDays: 0,
  };
  return saveExperiment(experiment);
}

export function findTemplate(slug: string) {
  return catalog.find((template) => template.slug === slug);
}

export function todayKey() {
  return isoDate(0);
}

export function tomorrowKey() {
  return isoDate(1);
}
