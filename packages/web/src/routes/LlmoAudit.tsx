import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { CheckList } from "../components/CheckList";
import { FeatureHeader } from "../components/FeatureHeader";
import { RecommendationList } from "../components/RecommendationList";
import { ScoreCard } from "../components/ScoreCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { auditLlmo } from "../lib/api";

export function LlmoAudit() {
  const [url, setUrl] = useState("");
  const audit = useMutation({ mutationFn: auditLlmo });

  return (
    <div>
      <FeatureHeader
        eyebrow="LLMO / AEO"
        title="AI検索で引用されやすいページか診断"
        description="構造化データ、見出し、AI bot への公開状態、llms.txt、引用しやすさを確認します。"
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
      <ResultArea
        error={audit.error}
        isPending={audit.isPending}
        result={audit.data}
      />
    </div>
  );
}

function ResultArea({
  error,
  isPending,
  result,
}: {
  error: unknown;
  isPending: boolean;
  result: Awaited<ReturnType<typeof auditLlmo>> | undefined;
}) {
  if (isPending) {
    return (
      <Card className="text-slate-muted">ページを取得して診断しています。</Card>
    );
  }

  if (error instanceof Error) {
    return <Card className="border-danger text-danger">{error.message}</Card>;
  }

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ScoreCard label="LLMO Score" score={result.totalScore} />
      <CheckList checks={result.checks} />
      <RecommendationList items={result.recommendations} />
    </div>
  );
}
