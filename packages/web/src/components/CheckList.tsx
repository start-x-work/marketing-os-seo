import { CheckCircle2, CircleAlert, XCircle } from "lucide-react";
import { Card } from "./ui/Card";

type CheckItem =
  | {
      id: string;
      label: string;
      detail: string;
      score: number;
    }
  | {
      id: string;
      label: string;
      detail: string;
      passed: boolean;
    };

interface CheckListProps {
  checks: CheckItem[];
}

export function CheckList({ checks }: CheckListProps) {
  return (
    <Card>
      <h2 className="text-xl font-light text-slate">チェック結果</h2>
      <div className="mt-5 divide-y divide-border">
        {checks.map((check) => {
          const passed = "passed" in check ? check.passed : check.score >= 70;
          const warning =
            "score" in check && check.score >= 50 && check.score < 70;

          return (
            <div key={check.id} className="flex gap-4 py-4">
              <div className="pt-1">
                {passed ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : warning ? (
                  <CircleAlert className="h-5 w-5 text-warning" />
                ) : (
                  <XCircle className="h-5 w-5 text-danger" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium text-slate">{check.label}</p>
                  {"score" in check && (
                    <span className="text-sm text-slate-muted">
                      {check.score}/100
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-muted">
                  {check.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
