import type { LLMOCheck } from "../audit";

export async function checkLlmsTxt(url: string): Promise<LLMOCheck> {
  const llmsUrl = `${new URL(url).origin}/llms.txt`;
  try {
    const res = await fetch(llmsUrl);
    const text = res.ok ? await res.text() : "";
    return {
      id: "llmo.llms-txt",
      label: "llms.txt",
      score: res.ok && text.trim().length > 0 ? 100 : 0,
      weight: 1,
      detail: res.ok
        ? `llms.txt found (${text.trim().length} chars)`
        : `llms.txt returned ${res.status}`,
    };
  } catch (error) {
    return {
      id: "llmo.llms-txt",
      label: "llms.txt",
      score: 0,
      weight: 1,
      detail: error instanceof Error ? error.message : "llms.txt check failed",
    };
  }
}
