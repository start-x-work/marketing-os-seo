import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FeatureHeader } from "../components/FeatureHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { contentBrief } from "../lib/api";

export function ContentBrief() {
  const [topic, setTopic] = useState("");
  const brief = useMutation({ mutationFn: contentBrief });

  return (
    <div>
      <FeatureHeader
        eyebrow="Content Brief"
        title="検索意図から編集用ブリーフを作る"
        description="本文は自動生成せず、検索意図・構成案・編集プロンプトだけを作成します。"
      />
      <Card className="mb-8">
        <form
          className="grid gap-3 sm:grid-cols-[1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            brief.mutate(topic);
          }}
        >
          <Input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="例: AI時代のSEO"
            required
          />
          <Button type="submit" disabled={brief.isPending}>
            {brief.isPending ? "作成中..." : "ブリーフ作成"}
          </Button>
        </form>
      </Card>
      {brief.isPending && (
        <Card className="text-slate-muted">
          AI が編集用ブリーフを整理しています。
        </Card>
      )}
      {brief.error instanceof Error && (
        <Card className="border-danger text-danger">{brief.error.message}</Card>
      )}
      {brief.data && (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo">
              Intent
            </p>
            <h2 className="mt-4 text-3xl font-light text-slate">
              {brief.data.intent}
            </h2>
            <p className="mt-4 text-sm text-slate-muted">
              Topic: {brief.data.topic}
            </p>
          </Card>
          <Card>
            <h2 className="text-xl font-light text-slate">推奨アウトライン</h2>
            <ol className="mt-5 list-decimal space-y-3 pl-5 text-slate-muted">
              {brief.data.outline.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </Card>
          <Card className="lg:col-span-2">
            <h2 className="text-xl font-light text-slate">編集プロンプト</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {brief.data.prompts.map((prompt) => (
                <div
                  key={prompt}
                  className="rounded-2xl bg-indigo-light/70 p-4 text-sm leading-6 text-slate-muted"
                >
                  {prompt}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
