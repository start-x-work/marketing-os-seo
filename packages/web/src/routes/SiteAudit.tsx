import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { CheckList } from "../components/CheckList";
import { FeatureHeader } from "../components/FeatureHeader";
import { ScoreCard } from "../components/ScoreCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { auditSite } from "../lib/api";

export function SiteAudit() {
  const [url, setUrl] = useState("");
  const audit = useMutation({ mutationFn: auditSite });

  const score = audit.data
    ? (audit.data.passedCount / Math.max(audit.data.totalCount, 1)) * 100
    : 0;

  return (
    <div>
      <FeatureHeader
        eyebrow="Technical SEO"
        title="サイトの基本SEOをURLから確認"
        description="title・description・canonical・構造化データ・robots.txt など、検索エンジンに伝わる基礎状態を診断します。"
      />
      <Card className="mb-8">
        <form
          className="grid gap-3 sm:grid-cols-[1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            audit.mutate(url);
          }}
        >
          <Input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
            required
          />
          <Button type="submit" disabled={audit.isPending}>
            {audit.isPending ? "診断中..." : "診断する"}
          </Button>
        </form>
      </Card>
      {audit.isPending && (
        <Card className="text-slate-muted">
          ページを取得して診断しています。
        </Card>
      )}
      {audit.error instanceof Error && (
        <Card className="border-danger text-danger">{audit.error.message}</Card>
      )}
      {audit.data && (
        <div className="space-y-6">
          <ScoreCard label="Passed Checks" score={score} />
          <Card>
            <p className="text-sm text-slate-muted">
              {audit.data.passedCount} / {audit.data.totalCount}{" "}
              件のチェックに合格
            </p>
          </Card>
          <CheckList checks={audit.data.checks} />
        </div>
      )}
    </div>
  );
}
