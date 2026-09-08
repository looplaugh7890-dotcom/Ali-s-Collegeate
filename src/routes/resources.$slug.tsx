import { useEffect, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { pageHead } from "@/lib/seo";
import { api } from "@/lib/api";
import type { Resource } from "@/types";
import { ResourceDetail } from "./resources.$slug.component";

export const Route = createFileRoute("/resources/$slug")({
  head: ({ params }) =>
    pageHead({
      title: "Resource",
      description: "Resource details at The Ali's Collegiate.",
      path: `/resources/${params.slug}`,
      type: "article",
    }),
  component: ResourceDetailPage,
});

function ResourceDetailPage() {
  const { slug } = Route.useParams();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getResources().then((resources) => {
      const found = resources.find((r) => r.slug === slug);
      if (found) setResource(found);
      else setNotFoundState(true);
    }).catch(() => setNotFoundState(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading resource...</p>
        </div>
      </SiteLayout>
    );
  }

  if (notFoundState || !resource) {
    throw notFound();
  }

  return <ResourceDetail resource={resource} />;
}
