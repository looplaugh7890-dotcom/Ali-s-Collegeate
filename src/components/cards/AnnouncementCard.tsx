import { ArrowRight, Bell, CalendarDays, FileText, Megaphone } from "lucide-react";
import { Link } from "@tanstack/react-router";

const iconFor: Record<string, typeof Bell> = {
  Announcement: Megaphone,
  Event: CalendarDays,
  "Academic Update": FileText,
  Reminder: Bell,
};

export function AnnouncementCard({
  category,
  title,
  description,
  date,
}: {
  category: string;
  title: string;
  description: string;
  date: string;
}) {
  const Icon = iconFor[category] ?? Bell;
  return (
    <article className="card-surface group flex h-full flex-col p-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-navy-2 transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
          <Icon className="size-4" />
        </span>
        <span className="text-[0.68rem] font-bold tracking-[0.16em] text-navy-2 uppercase">
          {category}
        </span>
      </div>
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <p className="mt-3 text-xs font-semibold text-foreground/70">{date}</p>
      <Link
        to="/blog"
        className="mt-5 inline-flex items-center gap-1.5 border-t border-border pt-4 text-sm font-semibold text-primary transition-colors hover:text-navy-2"
      >
        View Details
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </article>
  );
}