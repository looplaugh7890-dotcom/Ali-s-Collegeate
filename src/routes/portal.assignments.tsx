import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { api } from "@/lib/api";

export const Route = createFileRoute("/portal/assignments")({
  head: () =>
    pageHead({
      title: "Assignments",
      description: "View and submit your course assignments.",
      path: "/portal/assignments",
    }),
  component: () => (
    <AuthGuard requiredRole="student">
      <AssignmentsPage />
    </AuthGuard>
  ),
});

interface AssignmentItem {
  _id: string;
  title: string;
  instructions?: string;
  dueDate?: string;
  totalMarks: number;
  course?: { title: string; slug: string };
  status?: string;
  marks?: number;
}

function AssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAssignments()
      .then((data) => setAssignments(data as unknown as AssignmentItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusStyle: Record<string, string> = {
    pending: "border-gold/50 bg-gold/10 text-navy-2",
    submitted: "border-navy-2/30 bg-secondary text-navy-2",
    graded: "border-transparent bg-primary text-primary-foreground",
    overdue: "border-destructive/40 bg-destructive/10 text-destructive",
  };

  return (
    <PortalShell title="Assignments" description="Track what is due, submit work and review feedback.">
      <div className="space-y-6">
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-surface h-32 animate-pulse bg-surface" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="card-surface p-8 text-center text-sm text-muted-foreground">
            No assignments yet. Your teacher will add assignments to your enrolled courses.
          </div>
        ) : (
          <ul className="grid gap-4">
            {assignments.map((a) => (
              <li key={a._id} className="card-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold">{a.title}</h2>
                      {a.status && (
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wide uppercase ${statusStyle[a.status] || ""}`}>
                          {a.status}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{a.course?.title || ""}</p>
                    {a.instructions && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.instructions}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {a.dueDate && <p className="text-xs font-semibold text-navy-2">Due {new Date(a.dueDate).toLocaleDateString()}</p>}
                    {a.totalMarks ? <p className="mt-1 text-sm font-bold text-primary">{a.totalMarks} marks</p> : null}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4">
                  <Button variant="navy" size="sm" disabled={a.status === "graded"}>
                    <Upload className="size-3.5" aria-hidden /> Upload submission
                  </Button>
                  <Button variant="outlineNavy" size="sm">
                    View details
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PortalShell>
  );
}
