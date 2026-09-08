import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pageHead } from "@/lib/seo";
import { api } from "@/lib/api";

export const Route = createFileRoute("/portal/results")({
  head: () =>
    pageHead({
      title: "Results",
      description: "View your quiz and assignment results.",
      path: "/portal/results",
    }),
  component: () => (
    <AuthGuard requiredRole="student">
      <ResultsPage />
    </AuthGuard>
  ),
});

interface ResultItem {
  _id: string;
  assessment: string;
  courseTitle: string;
  date: string;
  obtained: number;
  total: number;
  grade: string;
}

function ResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getResults()
      .then((data) => setResults(data as unknown as ResultItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = results.reduce((s, r) => s + r.total, 0);
  const obtained = results.reduce((s, r) => s + r.obtained, 0);
  const percent = total ? Math.round((obtained / total) * 100) : 0;

  return (
    <PortalShell title="Results" description="View your quiz and assignment results.">
      <div className="space-y-6">
        {loading ? (
          <div className="card-surface p-6 text-center text-sm text-muted-foreground">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="card-surface p-8 text-center text-sm text-muted-foreground">
            No results yet. Complete quizzes and assignments to see your scores here.
          </div>
        ) : (
          <>
            <section className="card-surface p-6">
              <h2 className="text-base font-bold">Overall Performance</h2>
              <div className="mt-4 max-w-md">
                <ProgressBar value={percent} label={`${obtained} of ${total} marks`} />
              </div>
            </section>

            <section className="card-surface overflow-x-auto p-2 sm:p-4">
              <Table>
                <caption className="sr-only">Assessment results</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Marks</TableHead>
                    <TableHead className="text-right">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell className="font-semibold">{r.assessment}</TableCell>
                      <TableCell className="text-muted-foreground">{r.courseTitle}</TableCell>
                      <TableCell className="text-muted-foreground">{r.date}</TableCell>
                      <TableCell className="text-right">
                        {r.obtained}/{r.total}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">{r.grade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          </>
        )}
      </div>
    </PortalShell>
  );
}
