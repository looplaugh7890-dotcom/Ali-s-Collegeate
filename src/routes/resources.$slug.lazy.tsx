import { Link } from "@tanstack/react-router";
import { Download, FileText, Lock } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { AccessBadge } from "@/components/portal/AccessBadge";
import type { Resource } from "@/types";

export function ResourceDetail({ resource }: { resource: Resource }) {
  return (
    <SiteLayout>
      <PageHero eyebrow="Resources" title={resource.title} description={resource.description} />

      <section className="py-14 sm:py-16">
        <div className="container-page grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="text-xl">Files in this resource</h2>
            <span className="gold-rule mt-3" />
            <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
              <li className="flex items-center gap-3 px-5 py-4">
                <FileText className="size-4 shrink-0 text-gold" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{resource.title}</span>
                  <span className="text-xs text-muted-foreground">{resource.type} · {resource.meta || "Download"}</span>
                </span>
                {resource.access !== "free" ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-primary-foreground uppercase">
                    <Lock className="size-3" aria-hidden />
                    {resource.access === "enrolled" ? "Enrolled Only" : "Login Required"}
                  </span>
                ) : (
                  <Button variant="outlineNavy" size="sm" className="shrink-0">
                    <Download className="size-3.5" /> Download
                  </Button>
                )}
              </li>
            </ul>
          </div>

          <aside className="card-surface h-fit p-6">
            <h2 className="text-base font-bold">Access</h2>
            <div className="mt-3">
              <AccessBadge access={resource.access} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {resource.access === "enrolled"
                ? "This resource is reserved for enrolled students. Sign in to the student portal with the credentials issued after admission."
                : resource.access === "login"
                  ? "Sign in to the student portal to view and download this resource."
                  : "This resource is free to access. Sign in to keep track of what you have downloaded."}
            </p>
            <Button asChild variant="navy" size="xl" className="mt-5 w-full">
              <Link to="/portal/login">Student Login</Link>
            </Button>
            <Button asChild variant="outlineNavy" className="mt-3 w-full">
              <Link to="/resources">Back to Resources</Link>
            </Button>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
