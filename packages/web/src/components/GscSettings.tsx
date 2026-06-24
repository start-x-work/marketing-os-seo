import { useState } from "react";
import { startGscOAuth } from "../lib/api";
import {
  clearGscSession,
  type GscOAuthConfig,
  loadGscOAuthConfig,
  loadGscSession,
  saveGscOAuthConfig,
  saveOAuthState,
} from "../lib/gsc-settings";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";

export function GscSettings() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<GscOAuthConfig>(() => ({
    clientId: loadGscOAuthConfig()?.clientId ?? "",
    clientSecret: loadGscOAuthConfig()?.clientSecret ?? "",
  }));
  const [connected, setConnected] = useState(() => Boolean(loadGscSession()));

  return (
    <Card className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-light text-slate">
            Google Search Console（BYOK）
          </h2>
          <p className="mt-1 text-sm text-slate-muted">
            自分の Google Cloud OAuth アプリの Client ID / Secret
            をブラウザに保存します。運営側の Secrets は不要です。リダイレクト
            URI:{" "}
            <code className="text-xs">{`${typeof window !== "undefined" ? window.location.origin : ""}/gsc-callback`}</code>
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "閉じる" : "設定"}
        </Button>
      </div>
      {open && (
        <div className="mt-5 grid gap-4">
          <div className="grid gap-2 text-sm">
            <span className="text-slate-muted">OAuth Client ID</span>
            <Input
              value={config.clientId}
              onChange={(event) =>
                setConfig((prev) => ({ ...prev, clientId: event.target.value }))
              }
              placeholder="xxxx.apps.googleusercontent.com"
            />
          </div>
          <div className="grid gap-2 text-sm">
            <span className="text-slate-muted">OAuth Client Secret</span>
            <Input
              type="password"
              autoComplete="off"
              value={config.clientSecret}
              onChange={(event) =>
                setConfig((prev) => ({
                  ...prev,
                  clientSecret: event.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => {
                saveGscOAuthConfig(config);
              }}
            >
              認証情報を保存
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                saveGscOAuthConfig(config);
                const { authUrl, state } = await startGscOAuth();
                saveOAuthState(state);
                window.location.href = authUrl;
              }}
            >
              GSC と連携
            </Button>
            {connected && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  clearGscSession();
                  setConnected(false);
                }}
              >
                連携解除
              </Button>
            )}
          </div>
          {connected && (
            <p className="text-sm text-success">
              GSC アクセストークンが保存されています。
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
