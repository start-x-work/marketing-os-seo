import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "./render";

describe("render", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders JSON output", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    render({ ok: true }, "json");
    expect(log).toHaveBeenCalledWith(JSON.stringify({ ok: true }, null, 2));
    expect(String(log.mock.calls[1]?.[0])).toContain("Marketing-OS");
  });

  it("suppresses the commercial footer with quiet", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    render({ ok: true }, "json", { quiet: true });
    expect(log).toHaveBeenCalledTimes(1);
  });

  it("renders markdown output", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    render({ score: 90 }, "markdown");
    expect(log.mock.calls[0]?.[0]).toContain("### score");
  });
});
