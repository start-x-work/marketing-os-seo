import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FeatureHeader } from "../components/FeatureHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import { keywordMap } from "../lib/api";

export function KeywordMap() {
  const [seed, setSeed] = useState("");
  const [relatedText, setRelatedText] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const map = useMutation({ mutationFn: keywordMap });
  const related = useMemo(
    () =>
      relatedText
        .split(/\r?\n|,/)
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    [relatedText],
  );

  return (
    <div>
      <FeatureHeader
        eyebrow="Keyword Map"
        title="キーワードを intent とクラスタで整理"
        description="seed keyword と関連語から intent 分類・クラスタリングを行います。Google OAuth 設定後は GSC 連携の入口としても使えます。"
      />
      <Card className="mb-8">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            map.mutate({
              seed,
              related,
              siteUrl: siteUrl || undefined,
            });
          }}
        >
          <Input
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
            placeholder="例: マーケティング"
            required
          />
          <Textarea
            value={relatedText}
            onChange={(event) => setRelatedText(event.target.value)}
            placeholder="関連キーワードを改行またはカンマ区切りで入力"
            rows={5}
          />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              type="url"
              value={siteUrl}
              onChange={(event) => setSiteUrl(event.target.value)}
              placeholder="GSC連携用サイトURL（任意）"
            />
            <Button type="submit" disabled={map.isPending}>
              {map.isPending ? "整理中..." : "マップ作成"}
            </Button>
          </div>
          <a
            href="/api/auth/google"
            className="inline-flex text-sm font-medium text-indigo hover:underline"
          >
            Google Search Console と連携する
          </a>
        </form>
      </Card>
      {map.isPending && (
        <Card className="text-slate-muted">
          intent とクラスタを整理しています。
        </Card>
      )}
      {map.error instanceof Error && (
        <Card className="border-danger text-danger">{map.error.message}</Card>
      )}
      {map.data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="text-xl font-light text-slate">Intent 分類</h2>
            <div className="mt-5 divide-y divide-border">
              {Object.entries(map.data.intents).map(([keyword, intent]) => (
                <div
                  key={keyword}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="text-slate">{keyword}</span>
                  <span className="rounded-full bg-indigo-light px-3 py-1 text-xs font-medium text-indigo">
                    {intent}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-light text-slate">クラスタ</h2>
            <div className="mt-5 space-y-4">
              {Object.entries(map.data.clusters).map(([cluster, keywords]) => (
                <div
                  key={cluster}
                  className="rounded-2xl border border-border p-4"
                >
                  <p className="font-medium text-slate">{cluster}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-muted">
                    {keywords.join(" / ")}
                  </p>
                </div>
              ))}
            </div>
          </Card>
          {map.data.gscRows && map.data.gscRows.length > 0 && (
            <Card className="lg:col-span-2">
              <h2 className="text-xl font-light text-slate">GSC Queries</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-slate-muted">
                    <tr>
                      <th className="py-2">Query</th>
                      <th className="py-2">Clicks</th>
                      <th className="py-2">Impressions</th>
                      <th className="py-2">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {map.data.gscRows.map((row) => (
                      <tr key={row.query}>
                        <td className="py-3">{row.query}</td>
                        <td className="py-3">{row.clicks}</td>
                        <td className="py-3">{row.impressions}</td>
                        <td className="py-3">{row.position.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
