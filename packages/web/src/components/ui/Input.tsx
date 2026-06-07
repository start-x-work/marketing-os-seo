import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-border bg-white px-4 py-3 text-slate outline-none transition placeholder:text-slate-muted/60 focus:border-indigo focus:ring-4 focus:ring-indigo-light ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-xl border border-border bg-white px-4 py-3 text-slate outline-none transition placeholder:text-slate-muted/60 focus:border-indigo focus:ring-4 focus:ring-indigo-light ${className}`}
      {...props}
    />
  );
}
