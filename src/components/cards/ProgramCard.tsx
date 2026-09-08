import { Link } from "@tanstack/react-router";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { Program } from "@/types";

export function ProgramCard({ program, icon: Icon }: { program: Program; icon: LucideIcon }) {
  return (
    <article className="card-surface group flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
          <Icon className="size-5" />
        </span>
        <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.12em] text-navy-2 uppercase">
          {program.category}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold">{program.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{program.blurb}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
        <div>
          <dt className="text-muted-foreground">Duration</dt>
          <dd className="font-semibold">{program.duration}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Level</dt>
          <dd className="font-semibold">{program.level}</dd>
        </div>
      </dl>
      <Link
        to="/academics"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-navy-2"
      >
        View Program
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </article>
  );
}