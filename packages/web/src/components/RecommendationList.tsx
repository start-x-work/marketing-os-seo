import { Sparkles } from "lucide-react";
import { Card } from "./ui/Card";

interface RecommendationListProps {
  items: string[];
}

export function RecommendationList({ items }: RecommendationListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo" />
        <h2 className="text-xl font-light text-slate">改善提案</h2>
      </div>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-muted">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-indigo-light/70 px-4 py-3">
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}
