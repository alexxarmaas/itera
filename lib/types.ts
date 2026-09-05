export type ExperimentStatus = "active" | "completed";

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
