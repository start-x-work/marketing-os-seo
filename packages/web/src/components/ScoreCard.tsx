import { Card } from "./ui/Card";

interface ScoreCardProps {
  label?: string;
  score: number;
  suffix?: string;
}

export function ScoreCard({
  label = "Score",
  score,
  suffix = "/100",
}: ScoreCardProps) {
  const tone =
    score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-danger";

  return (
    <Card className="flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-muted">
          {label}
        </p>
        <p className={`mt-4 text-6xl font-light tracking-tight ${tone}`}>
          {Math.round(score)}
          <span className="text-2xl text-slate-muted">{suffix}</span>
        </p>
      </div>
      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo via-cyan-400 to-teal-300 opacity-80" />
    </Card>
  );
}
