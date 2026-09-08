import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ClipboardList,
  Clock,
  FileText,
  HelpCircle,
  Lock,
  PlayCircle,
  SignalHigh,
  User,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { pageHead } from "@/lib/seo";
import { api } from "@/lib/api";
import type { Course, Module } from "@/types";

export const Route = createFileRoute("/courses/$slug")({
  head: ({ params }) =>
    pageHead({
      title: "Course",
      description: "Course details at The Ali's Collegiate.",
      path: `/courses/${params.slug}`,
      type: "article",
    }),
  component: CourseDetail,
});

const typeIcon: Record<string, typeof PlayCircle> = {
  Video: PlayCircle,
  PDF: FileText,
  Quiz: HelpCircle,
  Assignment: ClipboardList,
};

function CourseDetail() {
  const { slug } = Route.useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getCourse(slug),
      api.getCourseModules(slug),
    ]).then(([c, m]) => {
      if (!c) {
        setNotFoundState(true);
      } else {
        setCourse(c);
        setModules(m);
      }
    }).catch(() => setNotFoundState(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading course...</p>
        </div>
      </SiteLayout>
    );
  }

  if (notFoundState || !course) {
    throw notFound();
  }

  return (
    <SiteLayout>
      <section className="bg-primary py-14 text-primary-foreground">
        <div className="container-page">
          <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">{course.program}</p>
          <h1 className="mt-3 max-w-3xl text-3xl text-primary-foreground sm:text-4xl">{course.title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-primary-foreground/75 sm:text-base">
            {course.description}
          </p>
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-primary-foreground/85">
            <li className="flex items-center gap-2">
              <User className="size-4 text-gold" /> {course.instructor}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-gold" /> {course.duration}
            </li>
            <li className="flex items-center gap-2">
              <SignalHigh className="size-4 text-gold" /> {course.level}
            </li>
            <li className="flex items-center gap-2">
              <FileText className="size-4 text-gold" /> {course.lessons} lessons
            </li>
          </ul>
        </div>
      </section>

      <section className="py-14">
        <div className="container-page grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="card-surface overflow-hidden !p-0">
              <div className="relative flex aspect-video items-center justify-center bg-surface">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <PlayCircle className="size-8" />
                </span>
                <span className="absolute bottom-4 left-4 rounded-md bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Video lesson preview
                </span>
              </div>
            </div>

            <h2 className="mt-10 text-xl">Course Modules</h2>
            <span className="gold-rule mt-3" />
            <div className="mt-6 space-y-4">
              {modules.map((m) => (
                <div key={m.id} className="rounded-xl border border-border bg-card">
                  <h3 className="border-b border-border px-5 py-3.5 text-sm font-bold">{m.title}</h3>
                  <ul>
                    {m.lessons.map((l) => {
                      const Icon = typeIcon[l.type] ?? FileText;
                      return (
                        <li
                          key={l.id}
                          className="flex items-center gap-3 border-b border-border px-5 py-3.5 last:border-0"
                        >
                          <Icon className={l.locked ? "size-4 shrink-0 text-muted-foreground" : "size-4 shrink-0 text-gold"} />
                          <span className="min-w-0 flex-1">
                            <span className={`block truncate text-sm font-medium ${l.locked ? "text-muted-foreground" : "text-foreground"}`}>
                              {l.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {l.type} · {l.duration}
                            </span>
                          </span>
                          {l.locked ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-navy-2 uppercase">
                              <Lock className="size-3" /> Enroll
                            </span>
                          ) : (
                            <span className="shrink-0 text-[0.65rem] font-bold tracking-wide text-navy-2 uppercase">
                              Open
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              {modules.length === 0 && (
                <p className="text-sm text-muted-foreground">Modules will be available soon.</p>
              )}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="card-surface p-6">
              <h2 className="text-base font-bold">Your Progress</h2>
              <div className="mt-4">
                <ProgressBar value={course.progress} label="Lessons completed" />
              </div>
              <Button asChild variant="navy" size="xl" className="mt-6 w-full">
                <Link to="/portal/courses">Continue Learning</Link>
              </Button>
              <Button asChild variant="outlineNavy" className="mt-3 w-full">
                <Link to="/admissions/apply">Enroll in this Course</Link>
              </Button>
            </div>

            <div className="card-surface p-6">
              <h2 className="text-base font-bold">Included Material</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><FileText className="size-4 text-gold" /> Chapter notes (PDF)</li>
                <li className="flex items-center gap-2"><PlayCircle className="size-4 text-gold" /> Recorded video lessons</li>
                <li className="flex items-center gap-2"><ClipboardList className="size-4 text-gold" /> Weekly assignments</li>
                <li className="flex items-center gap-2"><HelpCircle className="size-4 text-gold" /> Chapter quizzes</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
