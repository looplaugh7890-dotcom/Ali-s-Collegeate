import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Download, Filter, Lock, Unlock } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBanner } from "@/components/site/CtaBanner";
import { ResourceCard } from "@/components/cards/ResourceCard";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { api } from "@/lib/api";
import type { Resource } from "@/types";

export const Route = createFileRoute("/resources/")({
  head: () =>
    pageHead({
      title: "Resources",
      description: "Free notes, past papers, and study material for students at The Ali's Collegiate.",
      path: "/resources",
    }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getResources().finally(() => setLoading(false)).then(setResources);
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Resources"
        title="Study Material & Past Papers"
        description="Free notes, past papers, worksheets, and study guides. Some items require student portal login."
      />

      {/* How to Access */}
      <section className="border-b border-border bg-white py-8">
        <div className="container-page">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Unlock, title: "Free Access", desc: "Open to everyone. Click and download directly.", color: "text-green-600" },
              { icon: Lock, title: "Login Required", desc: "Free for registered students. Login to access.", color: "text-yellow-600" },
              { icon: Download, title: "Enrolled Only", desc: "Full content for enrolled students only.", color: "text-red-600" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
                <item.icon className={`size-5 shrink-0 ${item.color}`} />
                <div>
                  <p className="text-sm font-bold text-primary">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resource List */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="All Resources"
            title="Available Resources"
            subtitle="Click on any resource to view or download."
          />
          {loading ? (
            <div className="mx-auto mt-10 grid max-w-4xl gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card-surface h-24 animate-pulse bg-surface" />
              ))}
            </div>
          ) : resources.length > 0 ? (
            <div className="mx-auto mt-10 grid max-w-4xl gap-4">
              {resources.map((r) => (
                <ResourceCard key={r.slug} resource={r} />
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-10 max-w-4xl card-surface p-10 text-center">
              <BookOpen className="mx-auto size-12 text-muted-foreground/40" />
              <p className="mt-4 text-sm text-muted-foreground">No resources available yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Want More? */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="container-page text-center">
          <SectionHeading
            eyebrow="Need More?"
            title="Want Full Access to Study Material?"
            subtitle="Enrolled students get access to exclusive notes, worksheets, video solutions and more."
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="navy" size="xl">
              <Link to="/admissions/apply">
                Enroll Now <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaBanner />
    </SiteLayout>
  );
}
