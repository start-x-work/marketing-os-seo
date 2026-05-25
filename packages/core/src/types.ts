export interface Finding {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export type OutputFormat = "json" | "table" | "markdown";
