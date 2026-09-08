import { Quote } from "lucide-react";

export function TestimonialCard({
  name,
  program,
  quote,
  achievement,
  initials,
}: {
  name: string;
  program: string;
  quote: string;
  achievement?: string;
  initials: string;
}) {
  return (
    <figure className="card-surface flex h-full flex-col p-6">
      <Quote className="size-7 text-gold" aria-hidden />
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80">
        “{quote}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <span
          aria-hidden
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
        >
          {initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-primary">{name}</span>
          <span className="block text-xs text-muted-foreground">{program}</span>
          {achievement ? (
            <span className="mt-1 block text-xs font-semibold text-navy-2">{achievement}</span>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}