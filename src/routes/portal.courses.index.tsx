import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { AuthGuard } from "@/components/AuthGuard";
import { CourseCard } from "@/components/cards/CourseCard";
import { pageHead } from "@/lib/seo";
import { api } from "@/lib/api";
import type { Course } from "@/types";

export const Route = createFileRoute("/portal/courses/")({
  head: () =>
    pageHead({
      title: "My Courses",
      description: "Access your enrolled courses inside The Ali's Collegiate student portal.",
      path: "/portal/courses",
    }),
  component: () => (
    <AuthGuard requiredRole="student">
      <PortalCoursesPage />
    </AuthGuard>
  ),
});

function PortalCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCourses().finally(() => setLoading(false)).then(setCourses);
  }, []);

  return (
    <PortalShell title="My Courses" description="Continue lessons where you left off.">
      <div className="space-y-8">
        <section aria-labelledby="enrolled">
          <h2 id="enrolled" className="text-lg">
            Enrolled Courses
          </h2>
          {loading ? (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-surface h-48 animate-pulse bg-surface" />
              ))}
            </div>
          ) : (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((c) => (
                <CourseCard key={c.slug} course={c} showProgress href="portal" />
              ))}
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
