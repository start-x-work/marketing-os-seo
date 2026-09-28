import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertPublicHttpsUrl,
  assertPublicUrl,
  fetchFollowingPublicRedirects,
  isPrivateOrLoopbackHost,
} from "./safe-fetch";

describe("isPrivateOrLoopbackHost", () => {
  const privateHosts = [
    "localhost",
    "app.localhost",
    "service.internal",
    "printer.local",
    "127.0.0.1",
    "0.0.0.0",
    "10.0.0.5",
    "172.16.9.9",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254", // cloud metadata endpoint
    "100.64.0.1",
    "::1",
    "[::1]",
    "fc00::1",
    "fd12:3456::1",
    "fe80::1",
    "::ffff:127.0.0.1",
  ];
  for (const host of privateHosts) {
    it(`flags ${host} as private/loopback`, () => {
      expect(isPrivateOrLoopbackHost(host)).toBe(true);
    });
  }

  const publicHosts = ["example.com", "8.8.8.8", "172.32.0.1", "2606:4700::1"];
  for (const host of publicHosts) {
    it(`allows public host ${host}`, () => {
      expect(isPrivateOrLoopbackHost(host)).toBe(false);
    });
  }
});

describe("assertPublicHttpsUrl", () => {
  it("rejects http:// (https only)", () => {
    expect(() => assertPublicHttpsUrl("http://example.com")).toThrow(/https/i);
  });

  it("rejects non-http(s) schemes", () => {
    expect(() => assertPublicHttpsUrl("ftp://example.com")).toThrow();
    expect(() => assertPublicHttpsUrl("file:///etc/passwd")).toThrow();
  });

  it("rejects private / loopback / metadata hosts", () => {
    expect(() => assertPublicHttpsUrl("https://127.0.0.1")).toThrow(/private/i);
    expect(() => assertPublicHttpsUrl("https://localhost")).toThrow(/private/i);
    expect(() => assertPublicHttpsUrl("https://169.254.169.254")).toThrow(
      /private/i,
    );
    expect(() => assertPublicHttpsUrl("https://[::1]/")).toThrow(/private/i);
  });

  it("accepts a public https URL", () => {
    expect(
      assertPublicHttpsUrl("https://example.com/robots.txt").hostname,
    ).toBe("example.com");
  });

  it("rejects malformed URLs", () => {
    expect(() => assertPublicHttpsUrl("not a url")).toThrow(/invalid url/i);
  });
});

describe("assertPublicUrl allowHttp", () => {
  it("accepts http when allowHttp is set", () => {
    expect(
      assertPublicUrl("http://example.com", { allowHttp: true }).protocol,
    ).toBe("http:");
  });

  it("still rejects private hosts over http", () => {
    expect(() =>
      assertPublicUrl("http://192.168.0.1", { allowHttp: true }),
    ).toThrow(/private/i);
  });
});

describe("fetchFollowingPublicRedirects", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns a non-redirect response directly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("ok", { status: 200 })),
    );
    const res = await fetchFollowingPublicRedirects("https://example.com");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });

  it("follows a public redirect then returns the final response", async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url === "https://example.com/") {
        return new Response(null, {
          status: 302,
          headers: { location: "https://example.com/final" },
        });
      }
      return new Response("final", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const res = await fetchFollowingPublicRedirects("https://example.com/");
    expect(await res.text()).toBe("final");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects a redirect that targets a private host", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(null, {
            status: 302,
            headers: { location: "https://169.254.169.254/latest/meta-data" },
          }),
      ),
    );
    await expect(
      fetchFollowingPublicRedirects("https://example.com/"),
    ).rejects.toThrow(/private/i);
  });

  it("detects a redirect loop", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(null, {
            status: 301,
            headers: { location: "https://example.com/loop" },
          }),
      ),
    );
    await expect(
      fetchFollowingPublicRedirects("https://example.com/loop"),
    ).rejects.toThrow(/loop/i);
  });

  it("caps the number of redirects", async () => {
    let n = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        n += 1;
        return new Response(null, {
          status: 302,
          headers: { location: `https://example.com/hop-${n}` },
        });
      }),
    );
    await expect(
      fetchFollowingPublicRedirects(
        "https://example.com/start",
        {},
        {
          maxRedirects: 2,
        },
      ),
    ).rejects.toThrow(/too many redirects/i);
  });
});
