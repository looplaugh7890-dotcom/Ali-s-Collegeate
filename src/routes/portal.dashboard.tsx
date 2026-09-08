import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ClipboardList, FileText, HelpCircle, Trophy, Clock, SignalHigh } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { AuthGuard } from "@/components/AuthGuard";
import { StatCard } from "@/components/portal/StatCard";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { pageHead } from "@/lib/seo";
import { apiClient, endpoints } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/portal/dashboard")({
  head: () =>
    pageHead({
      title: "Student Dashboard",
      description: "Student dashboard for The Ali's Collegiate portal.",
      path: "/portal/dashboard",
    }),
  component: () => (
    <AuthGuard requiredRole="student">
      <DashboardPage />
    </AuthGuard>
  ),
});

interface CourseData {
  _id: string;
  slug: string;
  title: string;
  category: string;
  instructor: string;
  duration: string;
  level: string;
  imageUrl: string;
  lessons: number;
  chapters: number;
  enrolled: boolean;
  enrollmentId: string | null;
  progress: number;
}

interface AssignmentData {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  status: string;
}

interface QuizData {
  id: string;
  title: string;
  courseTitle: string;
  questions: number;
  durationMinutes: number;
  status: string;
  scheduledFor: string;
}

interface ResultData {
  id: string;
  assessment: string;
  courseTitle: string;
  obtained: number;
  total: number;
  grade: string;
}

function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [results, setResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const load = () => {
    Promise.all([
      apiClient.get<CourseData[]>(endpoints.student.allCourses).catch(() => []),
      apiClient.get<AssignmentData[]>(endpoints.student.assignments).catch(() => []),
      apiClient.get<QuizData[]>(endpoints.student.quizzes).catch(() => []),
      apiClient.get<ResultData[]>(endpoints.student.results).catch(() => []),
    ]).then(([c, a, q, r]) => {
      setCourses(c);
      setAssignments(a);
      setQuizzes(q);
      setResults(r);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const enrolledCourses = courses.filter((c) => c.enrolled);
  const pending = assignments.filter((a) => a.status === "pending" || a.status === "overdue");
  const upcoming = quizzes.filter((q) => q.status !== "completed");
  const totalChapters = courses.reduce((sum, c) => sum + c.chapters, 0);
  const totalLessons = courses.reduce((sum, c) => sum + c.lessons, 0);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      await apiClient.post(endpoints.student.enroll(courseId));
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <PortalShell
      title="Student Dashboard"
      description={`Welcome back, ${user?.name || "Student"}`}
    >
      <div className="space-y-8">
        <section aria-labelledby="overview">
          <h2 id="overview" className="text-lg">Overview</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={BookOpen} label="Enrolled Courses" value={String(enrolledCourses.length)} />
            <StatCard icon={FileText} label="Total Chapters" value={String(totalChapters)} />
            <StatCard icon={ClipboardList} label="Total Lectures" value={String(totalLessons)} />
            <StatCard icon={Trophy} label="Recent Results" value={String(results.length)} />
          </div>
        </section>

        <section aria-labelledby="progress">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="progress" className="text-lg">My Courses</h2>
            <Link to="/portal/courses" className="text-sm font-semibold text-primary hover:text-navy-2">
              View all courses
            </Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {courses.map((c) => (
              <div key={c._id} className="card-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-primary">{c.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.instructor} · {c.chapters} chapters · {c.lessons} lectures
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-semibold text-navy-2">
                        <Clock className="size-3" /> {c.duration || "Self-paced"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-semibold text-navy-2">
                        <SignalHigh className="size-3" /> {c.level || "All levels"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-semibold text-navy-2">
                        {c.category}
                      </span>
                    </div>
                  </div>
                  {c.enrolled ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/portal/courses/$slug" params={{ slug: c.slug }}>Continue</Link>
                    </Button>
                  ) : (
                    <Button
                      variant="navy"
                      size="sm"
                      disabled={enrolling === c._id}
                      onClick={() => handleEnroll(c._id)}
                    >
                      {enrolling === c._id ? "Enrolling..." : "Enroll"}
                    </Button>
                  )}
                </div>
                {c.enrolled && (
                  <div className="mt-4">
                    <ProgressBar value={c.progress} label="Progress" />
                  </div>
                )}
              </div>
            ))}
            {courses.length === 0 && !loading && (
              <div className="card-surface col-span-2 p-6 text-center text-sm text-muted-foreground">
                No courses available yet.
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section aria-labelledby="assignments" className="card-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="assignments" className="text-base font-bold">Pending Assignments</h2>
              <Link to="/portal/assignments" className="text-sm font-semibold text-primary hover:text-navy-2">All</Link>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {pending.length > 0 ? pending.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{a.title}</span>
                    <span className="text-xs text-muted-foreground">{a.courseTitle}</span>
                  </span>
                  <span className={`shrink-0 text-xs font-semibold ${a.status === "overdue" ? "text-destructive" : "text-navy-2"}`}>
                    {a.status === "overdue" ? "Overdue" : `Due ${a.dueDate}`}
                  </span>
                </li>
              )) : (
                <li className="py-3 text-sm text-muted-foreground">No pending assignments</li>
              )}
            </ul>
          </section>

          <section aria-labelledby="quizzes" className="card-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="quizzes" className="text-base font-bold">Upcoming Quizzes</h2>
              <Link to="/portal/quizzes" className="text-sm font-semibold text-primary hover:text-navy-2">All</Link>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {upcoming.length > 0 ? upcoming.map((q) => (
                <li key={q.id} className="flex items-start justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{q.title}</span>
                    <span className="text-xs text-muted-foreground">{q.questions} questions · {q.durationMinutes} min</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-navy-2">{q.scheduledFor}</span>
                </li>
              )) : (
                <li className="py-3 text-sm text-muted-foreground">No upcoming quizzes</li>
              )}
            </ul>
          </section>

          <section aria-labelledby="results" className="card-surface p-6 xl:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h2 id="results" className="text-base font-bold">Recent Results</h2>
              <Link to="/portal/results" className="text-sm font-semibold text-primary hover:text-navy-2">All</Link>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {results.length > 0 ? results.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{r.assessment}</span>
                    <span className="text-xs text-muted-foreground">{r.courseTitle}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-primary">
                    {r.obtained}/{r.total} ({r.grade})
                  </span>
                </li>
              )) : (
                <li className="py-3 text-sm text-muted-foreground">No results yet</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </PortalShell>
  );
}
