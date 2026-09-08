import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pageHead } from "@/lib/seo";
import { apiClient, endpoints } from "@/lib/api-client";

export const Route = createFileRoute("/admissions/status")({
  head: () =>
    pageHead({
      title: "Application Status",
      description:
        "Track the progress of your admission application to The Ali's Collegiate using your application reference number.",
      path: "/admissions/status",
    }),
  component: StatusPage,
});

interface ApplicationStatus {
  applicationNumber: string;
  firstName: string;
  lastName: string;
  program: string;
  stream: string;
  status: string;
  createdAt: string;
}

const statusOrder = ["submitted", "under-review", "accepted", "rejected"];

function StatusPage() {
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApplicationStatus | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await apiClient.get<ApplicationStatus>(`${endpoints.applications.status(ref.trim())}`);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application not found");
    } finally {
      setLoading(false);
    }
  };

  const statusIndex = result ? statusOrder.indexOf(result.status) : -1;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Admissions"
        title="Application status"
        description="Enter your application reference number to see where your admission stands."
      />
      <section className="py-14 sm:py-16">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <form className="card-surface h-fit p-6" onSubmit={handleCheck} aria-label="Track application">
            <h2 className="text-lg">Track your application</h2>
            <div className="mt-5 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ref">Application reference</Label>
                <Input id="ref" placeholder="TAC-2026-00001" value={ref} onChange={(e) => setRef(e.target.value)} />
              </div>
            </div>
            {error && (
              <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" variant="navy" size="xl" className="mt-5 w-full" disabled={loading}>
              {loading ? <><Loader2 className="size-4 animate-spin" /> Checking...</> : "Check Status"}
            </Button>
          </form>

          <div className="card-surface p-6">
            {result ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg">{result.applicationNumber}</h2>
                    <p className="text-sm text-muted-foreground">{result.firstName} {result.lastName} · {result.program} {result.stream ? `· ${result.stream}` : ""}</p>
                  </div>
                  <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground uppercase">
                    {result.status?.replace("-", " ")}
                  </span>
                </div>
                <ol className="mt-7 space-y-5">
                  {["Application submitted", "Under review", "Admission confirmed"].map((label, i) => {
                    const isDone = statusIndex >= i;
                    const isCurrent = statusIndex === i;
                    return (
                      <li key={label} className="flex gap-3">
                        {isDone && !isCurrent ? (
                          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold" />
                        ) : isCurrent ? (
                          <Clock className="mt-0.5 size-5 shrink-0 text-navy-2" />
                        ) : (
                          <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                        )}
                        <span>
                          <span className="block text-sm font-bold text-primary">{label}</span>
                          <span className="text-xs text-muted-foreground">
                            {isDone ? (isCurrent ? `Current: ${result.status?.replace("-", " ")}` : "Completed") : "Pending"}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="size-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">Enter your application number to check status</p>
              </div>
            )}
            <Button asChild variant="outlineNavy" className="mt-7 w-full sm:w-auto">
              <Link to="/contact">Contact Admissions Office</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
