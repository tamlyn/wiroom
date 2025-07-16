export interface PercentileDataPoint {
  age: number;
  p5?: number;
  p25?: number;
  p50?: number;
  p75?: number;
  p95?: number;
  [key: string]: number | undefined;
}

export type TabType = "current" | "uncertainty" | "decisions";
