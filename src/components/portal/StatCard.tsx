import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card-surface flex items-start gap-4 p-5">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-navy-2">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-2xl leading-none font-extrabold text-primary">{value}</span>
        <span className="mt-1.5 block text-sm font-semibold text-foreground">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
    </div>
  );
}
