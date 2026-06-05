export function OnboardingHeader({
  step,
  title,
  subtitle,
}: {
  step: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-foreground/70">
        Step {step}
      </div>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>
    </div>
  );
}

