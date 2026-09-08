import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckCircle2, HelpCircle, PlayCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBanner } from "@/components/site/CtaBanner";
import { CourseCard } from "@/components/cards/CourseCard";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { api } from "@/lib/api";
import type { Course } from "@/types";

export const Route = createFileRoute("/courses/")({
  head: () =>
    pageHead({
      title: "Courses",
      description: "Browse coaching courses at The Ali's Collegiate: Physics, Chemistry, Mathematics, Accounting, and more.",
      path: "/courses",
    }),
  component: CoursesPage,
});

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCourses().finally(() => setLoading(false)).then(setCourses);
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Courses"
        title="What We Teach"
        description="Board-focused courses with video lessons, notes, assignments and quizzes. Every topic is covered lesson by lesson."
      />

      {/* How Courses Work */}
      <section className="border-b border-border bg-white py-8">
        <div className="container-page">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookOpen, title: "Course Content", desc: "Each course has modules with video lessons, notes, and worksheets" },
              { icon: PlayCircle, title: "Video Lessons", desc: "Recorded lectures you can watch anytime. Never miss a class" },
              { icon: CheckCircle2, title: "Assignments", desc: "Practice homework after each topic. Get feedback from teachers" },
              { icon: HelpCircle, title: "Quizzes", desc: "Online tests after each module. Track your score and improve" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
                <item.icon className="size-5 shrink-0 text-gold" />
                <div>
                  <p className="text-sm font-bold text-primary">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course List */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="All Courses"
            title="Available Courses"
            subtitle="Click on any course to see modules, lessons and study material."
          />
          {loading ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-surface h-64 animate-pulse bg-surface" />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <CourseCard key={c.slug} course={c} />
              ))}
            </div>
          ) : (
            <div className="mt-10 card-surface p-10 text-center">
              <BookOpen className="mx-auto size-12 text-muted-foreground/40" />
              <p className="mt-4 text-sm text-muted-foreground">Courses are being set up. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Not Enrolled? */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="container-page text-center">
          <SectionHeading
            eyebrow="Not Enrolled Yet?"
            title="Want to Access These Courses?"
            subtitle="Enroll now to get full access to video lessons, assignments, quizzes and study material."
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="navy" size="xl">
              <Link to="/admissions/apply">
                Apply for Admission <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outlineNavy" size="xl">
              <Link to="/contact">Talk to Us First</Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaBanner />
    </SiteLayout>
  );
}
