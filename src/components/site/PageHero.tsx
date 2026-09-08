import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div
        aria-hidden
        className="absolute -top-24 -right-24 h-72 w-72 rounded-full border border-gold/25"
      />
      <div
        aria-hidden
        className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full border border-primary-foreground/10"
      />
      <div className="container-page relative py-14 sm:py-18">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-primary-foreground/70">
          <Link to="/" className="hover:text-gold">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-gold">{eyebrow}</span>
        </nav>
        <h1 className="mt-4 max-w-3xl text-3xl text-primary-foreground sm:text-4xl md:text-[2.6rem]">
          {title}
        </h1>
        <span className="gold-rule mt-5" />
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-primary-foreground/75 sm:text-base">
          {description}
        </p>
      </div>
    </section>
  );
}