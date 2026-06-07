interface FeatureHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function FeatureHeader({
  eyebrow,
  title,
  description,
}: FeatureHeaderProps) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-indigo">
        {eyebrow}
      </p>
      <h1 className="text-4xl font-light tracking-tight text-slate sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-muted sm:text-lg">
        {description}
      </p>
    </div>
  );
}
