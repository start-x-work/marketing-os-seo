import { CliError } from "@start-x-work/marketing-os-seo-core";
import pc from "picocolors";

export async function runSafely(task: () => Promise<void>): Promise<void> {
  try {
    await task();
  } catch (error) {
    if (error instanceof CliError) {
      console.error(pc.red(`Error [${error.code}]: ${error.message}`));
      process.exitCode = 1;
      return;
    }
    throw error;
  }
}
