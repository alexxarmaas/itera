import { Experiment, ExperimentEntry, ExperimentVariant } from "./types";

function dateDiff(start: string, end: string) {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

function todayKey() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

export function baselineEntries(experiment: Experiment) {
  return experiment.entries.filter((entry) => entry.phase === "baseline");
}

export function testEntries(experiment: Experiment) {
  return experiment.entries.filter((entry) => (entry.phase ?? "test") === "test");
}

export function effectiveExperimentDay(experiment: Experiment) {
  if ((experiment.phase ?? "test") === "baseline") return 0;
  const elapsed = dateDiff(experiment.startDate, todayKey()) + 1;
  if (elapsed <= 0) return 0;
  const historicalPause = experiment.pausedDays ?? 0;
  const currentPause = experiment.status === "paused" && experiment.pausedAt ? Math.max(0, dateDiff(experiment.pausedAt, todayKey())) : 0;
  return Math.max(0, Math.min(experiment.durationDays, elapsed - historicalPause - currentPause));
}

export function currentABVariant(experiment: Experiment): ExperimentVariant {
  const day = Math.max(1, effectiveExperimentDay(experiment));
  return day % 2 === 1 ? "A" : "B";
}

export function experimentProgress(experiment: Experiment) {
  const day = effectiveExperimentDay(experiment);
  const entries = testEntries(experiment);
  const expectedCheckins = Math.max(1, Math.min(Math.max(day, 1), experiment.durationDays));
  const uniqueEntryDays = new Set(entries.map((entry) => entry.date)).size;
  const completed = entries.filter((entry) => entry.completed).length;
  const coverage = day === 0 ? 0 : Math.min(1, uniqueEntryDays / expectedCheckins);
  const adherence = entries.length ? completed / entries.length : 0;
  const progress = experiment.status === "completed" ? 1 : day === 0 ? 0 : Math.min(1, day / experiment.durationDays);
  return { day, coverage, adherence, progress };
}

function average(entries: ExperimentEntry[], fallback: number) {
  return entries.length ? entries.reduce((sum, entry) => sum + entry.value, 0) / entries.length : fallback;
}

export function experimentMetrics(experiment: Experiment) {
  const entries = testEntries(experiment).filter((entry) => entry.completed);
  const progress = experimentProgress(experiment);

  if ((experiment.mode ?? "single") === "ab") {
    const a = entries.filter((entry) => entry.variant === "A");
    const b = entries.filter((entry) => entry.variant === "B");
    const aAverage = average(a, experiment.baseline);
    const bAverage = average(b, experiment.baseline);
    const delta = b.length ? ((aAverage - bAverage) / Math.max(Math.abs(bAverage), 0.1)) * 100 : 0;
    const enough = a.length >= 2 && b.length >= 2;
    const winner: ExperimentVariant | null = !enough || Math.abs(delta) < 5 ? null : delta > 0 ? "A" : "B";
    const evidence = a.length >= 4 && b.length >= 4 && progress.coverage >= 0.7 ? "sólida" : enough && progress.coverage >= 0.45 ? "moderada" : "inicial";
    return {
      average: winner === "A" ? aAverage : winner === "B" ? bAverage : (aAverage + bAverage) / 2,
      delta,
      done: entries.length,
      verdict: !enough ? "Aún no hay datos suficientes" : winner === "A" ? `${experiment.variantA ?? "A"} parece funcionar mejor` : winner === "B" ? `${experiment.variantB ?? "B"} parece funcionar mejor` : "No hay una diferencia clara",
      tone: !enough || !winner ? "neutral" : "positive",
      aAverage,
      bAverage,
      aCount: a.length,
      bCount: b.length,
      winner,
      evidence,
    } as const;
  }

  const averageValue = average(entries, experiment.baseline);
  const delta = ((averageValue - experiment.baseline) / Math.max(Math.abs(experiment.baseline), 0.1)) * 100;
  const evidence = entries.length >= 7 && progress.coverage >= 0.7 ? "sólida" : entries.length >= 4 && progress.coverage >= 0.45 ? "moderada" : "inicial";

  return {
    average: averageValue,
    delta,
    done: entries.length,
    verdict:
      entries.length < 3
        ? "Aún no hay datos suficientes"
        : delta > 8
          ? "Sí, parece funcionarte"
          : delta < -8
            ? "No parece ayudarte"
            : "No hay una señal clara",
    tone: entries.length < 3 ? "neutral" : delta > 8 ? "positive" : delta < -8 ? "negative" : "neutral",
    aAverage: 0,
    bAverage: 0,
    aCount: 0,
    bCount: 0,
    winner: null,
    evidence,
  } as const;
}

export function canFinishExperiment(experiment: Experiment) {
  const metrics = experimentMetrics(experiment);
  if ((experiment.mode ?? "single") === "ab") return metrics.aCount >= 2 && metrics.bCount >= 2;
  return metrics.done >= 3;
}

export function baselineProgress(experiment: Experiment) {
  const entries = baselineEntries(experiment);
  const required = Math.max(0, experiment.baselineDays ?? 0);
  return {
    done: entries.length,
    required,
    average: average(entries, experiment.baseline),
    complete: required === 0 || entries.length >= required,
  };
}
