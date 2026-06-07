import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-3xl border border-border bg-white p-6 shadow-soft ${className}`}
      {...props}
    />
  );
}
