import { catalog } from "./catalog";
import { addDaysKey, dateDiff, localDateKey } from "./dates";
import { Experiment, ExperimentEntry, ExperimentTemplate } from "./types";

const KEY = "itera.experiments.v1";

function entryKey(entry: ExperimentEntry) {
  return `${entry.date}|${entry.phase ?? "test"}|${entry.variant ?? ""}`;
}

function sanitizeEntries(experiment: Experiment) {
  const byKey = new Map<string, ExperimentEntry>();
  const min = Number.isFinite(experiment.metricMin) ? experiment.metricMin : 1;
  const max = Number.isFinite(experiment.metricMax) ? experiment.metricMax : 10;
  const fallback = Number.isFinite(experiment.baseline) ? experiment.baseline : min;

  for (const raw of experiment.entries ?? []) {
    if (!raw?.date) continue;
    const phase = raw.phase ?? "test";
    const numeric = Number(raw.value);
    const value = Math.min(max, Math.max(min, Number.isFinite(numeric) ? numeric : fallback));
    const entry: ExperimentEntry = {
      ...raw,
      value,
      phase,
      completed: phase === "baseline" ? true : Boolean(raw.completed),
      variant: phase === "baseline" ? undefined : raw.variant,
    };
    byKey.set(entryKey(entry), entry);
  }

  return [...byKey.values()].sort((a, b) => {
    const dateOrder = a.date.localeCompare(b.date);
    if (dateOrder !== 0) return dateOrder;
    return entryKey(a).localeCompare(entryKey(b));
  });
}

function average(entries: ExperimentEntry[], fallback: number) {
  if (!entries.length) return fallback;
  return entries.reduce((sum, entry) => sum + entry.value, 0) / entries.length;
}

function normalizeExperiment(experiment: Experiment): Experiment {
  const mode = experiment.mode ?? "single";
  const baselineDays = mode === "ab" ? 0 : Math.max(0, experiment.baselineDays ?? 0);
  const entries = sanitizeEntries(experiment);
  const observed = entries.filter((entry) => entry.phase === "baseline");

  let baseline = Number.isFinite(experiment.baseline) ? experiment.baseline : experiment.metricMin;
  let phase = mode === "ab" ? "test" as const : experiment.phase ?? "test";
  let baselineCompletedDate = mode === "ab" ? undefined : experiment.baselineCompletedDate;
  let startDate = experiment.startDate || todayKey();

  if (mode === "single" && baselineDays > 0 && observed.length) {
    baseline = average(observed, baseline);
  }

  // If persisted/imported data already contains enough baseline observations,
  // complete the phase deterministically. Once the test has started we never
  // rewrite startDate just because a past baseline value was corrected.
  if (mode === "single" && baselineDays > 0 && phase === "baseline" && observed.length >= baselineDays) {
    const completionDate = observed.at(-1)?.date ?? todayKey();
    phase = "test";
    baselineCompletedDate = completionDate;
    startDate = addDaysKey(completionDate, 1);
  }

  return {
    ...experiment,
    mode,
    phase,
    baselineDays,
    baseline,
    baselineCompletedDate,
    startDate,
    pausedDays: Math.max(0, experiment.pausedDays ?? 0),
    entries,
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
    startDate: localDateKey(-7),
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
      { date: localDateKey(-7), completed: true, value: 6.8, phase: "test" },
      { date: localDateKey(-6), completed: true, value: 7.1, phase: "test" },
      { date: localDateKey(-5), completed: false, value: 6.0, note: "Salí tarde", phase: "test" },
      { date: localDateKey(-4), completed: true, value: 7.4, phase: "test" },
      { date: localDateKey(-3), completed: true, value: 7.6, phase: "test" },
      { date: localDateKey(-2), completed: true, value: 7.3, phase: "test" },
      { date: localDateKey(-1), completed: true, value: 7.8, phase: "test" },
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

export function removeExperimentEntry(id: string, target: ExperimentEntry) {
  const experiment = getExperiment(id);
  if (!experiment) return { experiment: undefined, blocked: false, reason: undefined as string | undefined };

  const isBaseline = (target.phase ?? "test") === "baseline";
  const required = Math.max(0, experiment.baselineDays ?? 0);
  const baselineCount = experiment.entries.filter((entry) => entry.phase === "baseline").length;
  const baselineAlreadyClosed = (experiment.phase ?? "test") === "test" && required > 0;

  if (isBaseline && baselineAlreadyClosed && baselineCount <= required) {
    return {
      experiment,
      blocked: true,
      reason: "Esta observación forma parte del baseline que ya está usando la prueba. Puedes corregir su valor, pero no borrarla sin dejar el punto de partida incompleto.",
    };
  }

  const next = saveExperiment({
    ...experiment,
    entries: experiment.entries.filter((entry) => entryKey(entry) !== entryKey(target)),
  });
  return { experiment: next, blocked: false, reason: undefined as string | undefined };
}

export function pauseExperiment(id: string) {
  const experiment = getExperiment(id);
  if (!experiment || experiment.status !== "active") return experiment;
  return saveExperiment({ ...experiment, status: "paused", pausedAt: todayKey() });
}

export function resumeExperiment(id: string) {
  const experiment = getExperiment(id);
  if (!experiment || experiment.status !== "paused") return experiment;
  const addedPausedDays = experiment.pausedAt ? Math.max(0, dateDiff(experiment.pausedAt, todayKey())) : 0;
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
    startDate: todayKey(),
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
  return localDateKey(0);
}

export function tomorrowKey() {
  return localDateKey(1);
}
