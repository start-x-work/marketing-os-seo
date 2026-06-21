import { useState } from "react";
import { loadAiKeys, saveAiKeys, type AiKeys } from "../lib/ai-settings";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";

export function AiKeySettings() {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState<AiKeys>(() => loadAiKeys());
  const [saved, setSaved] = useState(false);

  return (
    <Card className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-light text-slate">AI API キー（BYOK）</h2>
          <p className="mt-1 text-sm text-slate-muted">
            キーはこのブラウザの sessionStorage にのみ保存されます。サーバー側の
            Secrets は不要です（自己ホスト時は任意）。
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
        <form
          className="mt-5 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveAiKeys(keys);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          <div className="grid gap-2 text-sm">
            <span className="text-slate-muted">Gemini API key</span>
            <Input
              type="password"
              autoComplete="off"
              value={keys.gemini ?? ""}
              onChange={(event) =>
                setKeys((prev) => ({ ...prev, gemini: event.target.value }))
              }
              placeholder="AIza..."
            />
          </div>
          <div className="grid gap-2 text-sm">
            <span className="text-slate-muted">OpenAI API key（任意）</span>
            <Input
              type="password"
              autoComplete="off"
              value={keys.openai ?? ""}
              onChange={(event) =>
                setKeys((prev) => ({ ...prev, openai: event.target.value }))
              }
            />
          </div>
          <div className="grid gap-2 text-sm">
            <span className="text-slate-muted">Anthropic API key（任意）</span>
            <Input
              type="password"
              autoComplete="off"
              value={keys.anthropic ?? ""}
              onChange={(event) =>
                setKeys((prev) => ({ ...prev, anthropic: event.target.value }))
              }
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit">保存</Button>
            {saved && <span className="text-sm text-success">保存しました</span>}
          </div>
        </form>
      )}
    </Card>
  );
}
