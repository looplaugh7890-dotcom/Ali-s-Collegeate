import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  FileText,
  FileType2,
  GraduationCap,
  Award,
  PlayCircle,
  ScrollText,
} from "lucide-react";
import { AccessBadge } from "@/components/portal/AccessBadge";
import type { Resource, ResourceType } from "@/types";

const typeIcon: Record<ResourceType, typeof FileText> = {
  PDF: FileText,
  Video: PlayCircle,
  Document: FileType2,
  "Past Paper": ScrollText,
  "Study Material": GraduationCap,
  Scholarship: Award,
  "Exam Schedule": CalendarClock,
};

export function ResourceCard({ resource }: { resource: Resource }) {
  const Icon = typeIcon[resource.type] ?? FileText;
  const cta =
    resource.access === "free"
      ? "Open Resource"
      : resource.access === "login"
        ? "Login to Access"
        : "For Enrolled Students";

  return (
    <article className="card-surface group flex items-start gap-4 p-5">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-navy-2 transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-bold">{resource.title}</h3>
          <AccessBadge access={resource.access} />
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-foreground/60">
            {resource.type} · {resource.meta}
          </span>
          <Link
            to="/resources/$slug"
            params={{ slug: resource.slug }}
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-primary hover:text-navy-2"
          >
            {cta}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
