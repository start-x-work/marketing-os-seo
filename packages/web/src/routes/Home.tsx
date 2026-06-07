import { ArrowRight, Bot, FileText, Gauge, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";

const features = [
  {
    to: "/llmo",
    title: "LLMO / AEO 診断",
    description: "AI検索で引用されやすい構造かをURLから診断します。",
    icon: Bot,
  },
  {
    to: "/site",
    title: "サイト診断",
    description: "meta、構造化データ、クロール可能性を確認します。",
    icon: Gauge,
  },
  {
    to: "/brief",
    title: "コンテンツブリーフ",
    description: "検索意図、アウトライン、編集用プロンプトを作ります。",
    icon: FileText,
  },
  {
    to: "/keywords",
    title: "キーワードマップ",
    description: "intent分類とクラスタリングで企画の土台を整えます。",
    icon: Search,
  },
];

export function Home() {
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-indigo">
            SEO Toolkit
          </p>
          <h1 className="text-5xl font-light tracking-tight text-slate sm:text-6xl">
            CLI の4機能を、ブラウザから。
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-muted">
            Marketing-OS SEO は、LLMO診断・技術SEO診断・ブリーフ作成・
            キーワード整理を同じ core ロジックで実行する Web UI です。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/llmo"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo/90"
            >
              診断を始める
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/start-x-work/marketing-os-seo"
              className="inline-flex items-center rounded-xl border border-border bg-white px-5 py-3 text-sm font-medium text-slate transition hover:border-indigo"
            >
              GitHubを見る
            </a>
          </div>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-br from-indigo via-cyan-400 to-teal-300 p-1">
            <div className="rounded-[1.35rem] bg-white p-7">
              <p className="text-sm text-slate-muted">Current workflow</p>
              <div className="mt-6 space-y-4">
                {features.map((feature, index) => (
                  <div key={feature.to} className="flex items-center gap-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-light text-sm font-medium text-indigo">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate">{feature.title}</p>
                      <p className="text-sm text-slate-muted">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>
      <section className="grid gap-5 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.to} to={feature.to}>
              <Card className="h-full transition hover:-translate-y-1 hover:border-indigo">
                <Icon className="h-7 w-7 text-indigo" />
                <h2 className="mt-6 text-2xl font-light text-slate">
                  {feature.title}
                </h2>
                <p className="mt-3 leading-7 text-slate-muted">
                  {feature.description}
                </p>
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
