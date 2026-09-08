import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CalendarDays, Megaphone, Shield } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBanner } from "@/components/site/CtaBanner";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/updates/official")({
  head: () =>
    pageHead({
      title: "Official Updates",
      description: "Official institute announcements, notices and important communications from The Ali's Collegiate.",
      path: "/updates/official",
    }),
  component: OfficialUpdatesPage,
});

const officialUpdates = [
  {
    icon: Megaphone,
    title: "Admissions Open for 2026-27",
    description: "Limited seats available for Classes IX to XII across Science, Commerce and Arts groups. Apply online or visit the campus.",
    date: "Open till 30 September 2026",
  },
  {
    icon: CalendarDays,
    title: "Career Guidance Seminar",
    description: "Choosing the right stream and university pathway after intermediate. Open to all students and parents.",
    date: "20 September 2026 · 10:00 AM",
  },
  {
    icon: Bell,
    title: "Monthly Fee Submission",
    description: "Submit fees at the campus office or through the notified bank account. Fees must be submitted before the 10th of each month.",
    date: "Before 10th of each month",
  },
  {
    icon: Shield,
    title: "Campus Timing Update",
    description: "Effective from 1 September 2026, the campus will operate from 2:00 PM to 7:00 PM on weekdays and 9:00 AM to 2:00 PM on Saturdays.",
    date: "Effective 1 September 2026",
  },
];

function OfficialUpdatesPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Official Updates"
        title="Official Institute Announcements"
        description="Official notices, announcements and communications from The Ali's Collegiate administration."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Latest"
            title="Official Announcements"
            subtitle="Important updates and notices from the institute administration."
          />
          <div className="mx-auto mt-10 max-w-3xl space-y-5">
            {officialUpdates.map((item) => (
              <article key={item.title} className="card-surface flex items-start gap-4 p-6">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <item.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  <p className="mt-2 text-xs font-semibold text-navy-2">{item.date}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </SiteLayout>
  );
}
