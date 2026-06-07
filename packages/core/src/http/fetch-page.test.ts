import { afterEach, describe, expect, it, vi } from "vitest";
import { FetchError } from "../errors";
import { fetchPage } from "./fetch-page";

describe("fetchPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws FetchError on non-2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not found", { status: 404 })),
    );
    await expect(fetchPage("https://example.com/missing")).rejects.toThrow(
      FetchError,
    );
  });
});
