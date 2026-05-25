export interface GSCQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  position: number;
}

export interface GSCOptions {
  siteUrl: string;
  startDate: string;
  endDate: string;
  limit?: number;
}

export async function fetchGSCQueries(
  options: GSCOptions,
): Promise<GSCQueryRow[]> {
  const accessToken = await getAccessToken();
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(options.siteUrl)}/searchAnalytics/query`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: options.startDate,
      endDate: options.endDate,
      dimensions: ["query"],
      rowLimit: options.limit ?? 100,
    }),
  });
  if (!res.ok) {
    throw new Error(`GSC query failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as {
    rows?: Array<{
      keys?: string[];
      clicks?: number;
      impressions?: number;
      position?: number;
    }>;
  };
  return (json.rows ?? []).map((row) => ({
    query: row.keys?.[0] ?? "",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    position: row.position ?? 0,
  }));
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.GSC_CLIENT_ID;
  const clientSecret = process.env.GSC_CLIENT_SECRET;
  const refreshToken = process.env.GSC_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "GSC_CLIENT_ID, GSC_CLIENT_SECRET, and GSC_REFRESH_TOKEN are required",
    );
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(
      `GSC token refresh failed: ${res.status} ${await res.text()}`,
    );
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("GSC token response did not include access_token");
  }
  return json.access_token;
}
