import { Experiment } from "./types";

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
