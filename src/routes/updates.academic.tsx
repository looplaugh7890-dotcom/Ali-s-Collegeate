import { createFileRoute, Link } from "@tanstack/react-router";
import { BookMarked, Calendar, FileText } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBanner } from "@/components/site/CtaBanner";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/updates/academic")({
  head: () =>
    pageHead({
      title: "TAC Academic Updates",
      description: "Academic notices, test schedules and important academic information from The Ali's Collegiate.",
      path: "/updates/academic",
    }),
  component: AcademicUpdatesPage,
});

const academicUpdates = [
  {
    icon: FileText,
    title: "Revised Weekly Test Pattern",
    description: "Weekly tests now include a short conceptual section for every subject. This change is effective from 1 September 2026.",
    date: "Effective 1 September 2026",
  },
  {
    icon: Calendar,
    title: "Mid-Term Examination Schedule",
    description: "Mid-term examinations for Classes IX to XII will be held from 15th to 25th October 2026. Detailed timetable is available at the campus office.",
    date: "15 — 25 October 2026",
  },
  {
    icon: BookMarked,
    title: "New Study Material Available",
    description: "Updated notes for Physics, Chemistry and Mathematics for Classes XI and XII have been uploaded to the student portal.",
    date: "Uploaded 20 August 2026",
  },
  {
    icon: FileText,
    title: "Parent-Teacher Meeting",
    description: "Monthly parent-teacher meeting will be held on the first Saturday of each month. Parents are encouraged to attend.",
    date: "First Saturday of each month",
  },
];

function AcademicUpdatesPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Academic Updates"
        title="TAC Academic Updates"
        description="Academic notices, test schedules and important academic information for students and parents."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Latest"
            title="Academic Notices & Updates"
            subtitle="Stay informed about academic changes, test schedules and study material."
          />
          <div className="mx-auto mt-10 max-w-3xl space-y-5">
            {academicUpdates.map((item) => (
              <article key={item.title} className="card-surface flex items-start gap-4 p-6">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
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
