export interface CompleteOptions {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

export interface AIProvider {
  complete(prompt: string, opts?: CompleteOptions): Promise<string>;
  embed(texts: string[]): Promise<number[][]>;
}
