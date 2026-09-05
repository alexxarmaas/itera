export type ExperimentStatus = "active" | "paused" | "completed" | "abandoned";

export type ExperimentEntry = {
  date: string;
  completed: boolean;
  value: number;
  note?: string;
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
};
