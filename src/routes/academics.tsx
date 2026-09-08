import { createFileRoute } from "@tanstack/react-router";
import { Atom, BookMarked, Briefcase, GraduationCap, Laptop, MessageSquare, Palette } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBanner } from "@/components/site/CtaBanner";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { pageHead } from "@/lib/seo";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import type { Course } from "@/types";

export const Route = createFileRoute("/academics")({
  head: () =>
    pageHead({
      title: "Academics",
      description:
        "Academic structure at The Ali's Collegiate: Classes IX-XII board coaching, Science, Commerce and Arts streams, plus computer, English and junior tuition classes.",
      path: "/academics",
    }),
  component: AcademicsPage,
});

const iconMap: Record<string, typeof BookMarked> = {
  science: Atom,
  commerce: Briefcase,
  arts: Palette,
  "computer-courses": Laptop,
  "english-language": MessageSquare,
  "tuition-classes": GraduationCap,
};

const groups = [
  { key: "Science" as const, title: "Science", subtitle: "Physics, Chemistry, Mathematics and Biology." },
  { key: "Commerce" as const, title: "Commerce", subtitle: "Accounting, Economics and Business Studies." },
  { key: "Arts" as const, title: "Arts", subtitle: "Humanities and language subjects." },
];

const schedule = [
  { label: "Morning batches", value: "8:00 AM — 11:00 AM" },
  { label: "Afternoon batches", value: "1:00 PM — 4:00 PM" },
  { label: "Evening batches", value: "5:00 PM — 8:00 PM" },
  { label: "Weekly tests", value: "Every Saturday" },
];

function AcademicsPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api.getCourses().then(setCourses);
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Academics"
        title="Academic structure designed around the board exam"
        description="Classes IX to XII across Science, Commerce and Arts, supported by weekly assessment, revision cycles and dedicated doubt sessions."
      />

      {groups.map((g, gi) => (
        <section key={g.key} className={gi % 2 === 1 ? "bg-surface py-16 sm:py-20" : "py-16 sm:py-20"}>
          <div className="container-page">
            <SectionHeading align="left" eyebrow="Subjects" title={g.title} subtitle={g.subtitle} />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses
                .filter((c) => c.category === g.key)
                .map((c) => (
                  <ProgramCard key={c.slug} program={{ slug: c.slug, name: c.title, category: g.key, blurb: c.description || "", duration: c.duration, level: c.level }} icon={iconMap[c.slug] ?? BookMarked} />
                ))}
              {courses.filter((c) => c.category === g.key).length === 0 && (
                <p className="text-sm text-muted-foreground">No subjects added yet. Check back soon.</p>
              )}
            </div>
          </div>
        </section>
      ))}

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Timetable" title="Class timings" subtitle="Batch timings may vary slightly by program and campus capacity." />
          <div className="mx-auto mt-10 max-w-3xl overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[28rem] text-sm">
              <caption className="sr-only">Class timings at The Ali&apos;s Collegiate</caption>
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left font-semibold">Session</th>
                  <th scope="col" className="px-5 py-3 text-left font-semibold">Timing</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((s, i) => (
                  <tr key={s.label} className={i % 2 ? "bg-surface" : "bg-card"}>
                    <th scope="row" className="px-5 py-3 text-left font-semibold text-primary">{s.label}</th>
                    <td className="px-5 py-3 text-muted-foreground">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <CtaBanner />
    </SiteLayout>
  );
}