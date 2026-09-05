import { Experiment } from "./types";

function dateDiff(start: string, end: string) {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / 86400000));
}

function todayKey() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

export function effectiveExperimentDay(experiment: Experiment) {
  const elapsed = dateDiff(experiment.startDate, todayKey()) + 1;
  const historicalPause = experiment.pausedDays ?? 0;
  const currentPause = experiment.status === "paused" && experiment.pausedAt ? dateDiff(experiment.pausedAt, todayKey()) : 0;
  return Math.max(1, Math.min(experiment.durationDays, elapsed - historicalPause - currentPause));
}

export function experimentProgress(experiment: Experiment) {
  const day = effectiveExperimentDay(experiment);
  const expectedCheckins = Math.max(1, Math.min(day, experiment.durationDays));
  const uniqueEntryDays = new Set(experiment.entries.map((entry) => entry.date)).size;
  const completed = experiment.entries.filter((entry) => entry.completed).length;
  const coverage = Math.min(1, uniqueEntryDays / expectedCheckins);
  const adherence = experiment.entries.length ? completed / experiment.entries.length : 0;
  const progress = experiment.status === "completed" ? 1 : Math.min(1, day / experiment.durationDays);
  return { day, coverage, adherence, progress };
}

export function experimentMetrics(experiment: Experiment) {
  const valid = experiment.entries.filter((entry) => entry.completed);
  const average = valid.length
    ? valid.reduce((sum, entry) => sum + entry.value, 0) / valid.length
    : experiment.baseline;
  const delta = ((average - experiment.baseline) / Math.max(experiment.baseline, 0.1)) * 100;

  return {
    average,
    delta,
    done: valid.length,
    verdict:
      valid.length < 3
        ? "Aún no hay datos suficientes"
        : delta > 8
          ? "Sí, parece funcionarte"
          : delta < -8
            ? "No parece ayudarte"
            : "No hay una señal clara",
    tone: valid.length < 3 ? "neutral" : delta > 8 ? "positive" : delta < -8 ? "negative" : "neutral",
  } as const;
}
