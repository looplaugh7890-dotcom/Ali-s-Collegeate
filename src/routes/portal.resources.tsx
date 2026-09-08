import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ResourceCard } from "@/components/cards/ResourceCard";
import { pageHead } from "@/lib/seo";
import { api } from "@/lib/api";
import type { Resource } from "@/types";

export const Route = createFileRoute("/portal/resources")({
  head: () =>
    pageHead({
      title: "Portal Resources",
      description: "Study materials available inside The Ali's Collegiate student portal.",
      path: "/portal/resources",
    }),
  component: () => (
    <AuthGuard requiredRole="student">
      <PortalResourcesPage />
    </AuthGuard>
  ),
});

function PortalResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getResources().finally(() => setLoading(false)).then(setResources);
  }, []);

  return (
    <PortalShell title="Resources" description="Notes, worksheets, past papers and schedules.">
      <div className="space-y-6">
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-surface h-24 animate-pulse bg-surface" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {resources.map((r) => (
              <ResourceCard key={r.slug} resource={r} />
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
