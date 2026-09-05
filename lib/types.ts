export type ExperimentStatus = "active" | "paused" | "completed" | "abandoned";
export type ExperimentMode = "single" | "ab";
export type ExperimentPhase = "baseline" | "test";
export type ExperimentVariant = "A" | "B";
export type ExperimentDecision = "keep" | "discard" | "repeat" | "variant";

export type ExperimentEntry = {
  date: string;
  completed: boolean;
  value: number;
  note?: string;
  phase?: ExperimentPhase;
  variant?: ExperimentVariant;
};

export type Experiment = {
  id: string;
  title: string;
  emoji: string;
  category: string;
  description: string;
  durationDays: number;
  startDate: string;
  status: ExperimentStatus;
  completedDate?: string;
  abandonedDate?: string;
  pausedAt?: string;
  pausedDays?: number;
  hypothesis: string;
  metricLabel: string;
  metricMin: number;
  metricMax: number;
  metricUnit: string;
  baseline: number;
  entries: ExperimentEntry[];
  mode?: ExperimentMode;
  phase?: ExperimentPhase;
  baselineDays?: number;
  baselineCompletedDate?: string;
  variantA?: string;
  variantB?: string;
  decision?: ExperimentDecision;
  decisionNote?: string;
};

export type ExperimentTemplate = {
  slug: string;
  title: string;
  emoji: string;
  category: string;
  description: string;
  durationDays: number;
  hypothesis: string;
  metricLabel: string;
  metricMin: number;
  metricMax: number;
  metricUnit: string;
  baseline: number;
  baselineDays?: number;
};
