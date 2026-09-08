import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, HelpCircle } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { api } from "@/lib/api";

export const Route = createFileRoute("/portal/quizzes")({
  head: () =>
    pageHead({
      title: "Quizzes",
      description: "Practice chapter quizzes and timed tests.",
      path: "/portal/quizzes",
    }),
  component: () => (
    <AuthGuard requiredRole="student">
      <QuizzesPage />
    </AuthGuard>
  ),
});

interface QuizItem {
  _id: string;
  title: string;
  durationMinutes: number;
  questions: Array<unknown>;
  isPublished: boolean;
  course?: { title: string; slug: string };
}

function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getQuizzes()
      .then((data) => setQuizzes(data as unknown as QuizItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalShell title="Quizzes" description="Practice chapter quizzes and timed tests.">
      <div className="space-y-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-surface h-48 animate-pulse bg-surface" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="card-surface p-8 text-center text-sm text-muted-foreground">
            No quizzes available yet. Your teacher will add quizzes to your courses.
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {quizzes.map((q) => (
              <li key={q._id} className="card-surface flex h-full flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold">{q.title}</h2>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wide uppercase ${q.isPublished ? "border-gold/50 bg-gold/10 text-navy-2" : "border-transparent bg-secondary text-muted-foreground"}`}>
                    {q.isPublished ? "Available" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{q.course?.title || ""}</p>
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-foreground/70">
                  <li className="flex items-center gap-1.5">
                    <HelpCircle className="size-3.5 text-gold" aria-hidden /> {q.questions.length} questions
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-gold" aria-hidden /> {q.durationMinutes} minutes
                  </li>
                </ul>
                <div className="mt-5 flex-1" />
                <Button variant="navy" className="w-full" disabled={!q.isPublished}>
                  Start quiz
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PortalShell>
  );
}
