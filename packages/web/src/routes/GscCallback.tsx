import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { exchangeGscCode } from "../lib/api";
import {
  consumeOAuthState,
  gscRedirectUri,
  loadGscOAuthConfig,
  saveGscSession,
} from "../lib/gsc-settings";
import { Card } from "../components/ui/Card";

export function GscCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const expected = consumeOAuthState();
    const config = loadGscOAuthConfig();

    if (!code || !state || !expected || state !== expected) {
      setError("OAuth state mismatch or missing code.");
      return;
    }
    if (!config) {
      setError("GSC OAuth credentials not found. Configure them in Settings first.");
      return;
    }

    exchangeGscCode({
      code,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: gscRedirectUri(),
    })
      .then((session) => {
        saveGscSession(session);
        navigate("/keywords?gsc=connected", { replace: true });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "OAuth exchange failed");
      });
  }, [navigate, params]);

  return (
    <Card>
      {error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <p className="text-slate-muted">Google Search Console と連携しています…</p>
      )}
    </Card>
  );
}
