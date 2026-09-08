import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { BlogCard } from "@/components/cards/BlogCard";
import { pageHead } from "@/lib/seo";
import { api } from "@/lib/api";
import type { BlogPost } from "@/types";

export const Route = createFileRoute("/blog/")({
  head: () =>
    pageHead({
      title: "Blog",
      description:
        "Study guidance, exam preparation strategies and career advice from the faculty of The Ali's Collegiate.",
      path: "/blog",
    }),
  component: BlogPage,
});

function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPosts().finally(() => setLoading(false)).then(setPosts);
  }, []);

  const featured = posts.find((p) => p.featured);
  const rest = featured ? posts.filter((p) => p.slug !== featured.slug) : posts;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Blog"
        title="Guidance from our faculty"
        description="Practical articles on exam preparation, study habits, stream selection and supporting students at home."
      />
      <section className="py-16 sm:py-20" aria-labelledby="articles">
        <div className="container-page">
          <h2 id="articles" className="sr-only">
            Articles
          </h2>
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-surface h-48 animate-pulse bg-surface" />
              ))}
            </div>
          ) : (
            <>
              {featured ? <BlogCard post={featured} featured /> : null}
              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {rest.map((p) => (
                  <BlogCard key={p.slug} post={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
