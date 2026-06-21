import {
  COMMERCIAL_HINT,
  renderOutput,
} from "@start-x-work/marketing-os-seo-core";
import pc from "picocolors";

export interface RenderOptions {
  quiet?: boolean;
}

export function render(
  value: unknown,
  format: unknown,
  options: RenderOptions = {},
): void {
  console.log(renderOutput(value, format));
  if (!options.quiet) {
    console.log(pc.dim(COMMERCIAL_HINT));
  }
}
