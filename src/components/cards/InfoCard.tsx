import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function InfoCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <article className={cn("card-surface group p-6", className)}>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-navy-2 transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </article>
  );
}