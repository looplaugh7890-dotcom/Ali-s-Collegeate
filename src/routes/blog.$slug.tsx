import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock, User } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CtaBanner } from "@/components/site/CtaBanner";
import { BlogCard } from "@/components/cards/BlogCard";
import { pageHead } from "@/lib/seo";
import { api } from "@/lib/api";
import type { BlogPost } from "@/types";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) =>
    pageHead({
      title: "Article",
      description: "Blog article at The Ali's Collegiate.",
      path: `/blog/${params.slug}`,
      type: "article",
    }),
  component: BlogDetail,
});

function BlogDetail() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getPost(slug),
      api.getPosts(),
    ]).then(([p, posts]) => {
      if (!p) setNotFoundState(true);
      else {
        setPost(p);
        setAllPosts(posts);
      }
    }).catch(() => setNotFoundState(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading article...</p>
        </div>
      </SiteLayout>
    );
  }

  if (notFoundState || !post) {
    throw notFound();
  }

  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <SiteLayout>
      <article className="py-14 sm:py-16">
        <div className="container-page mx-auto max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-navy-2 hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back to blog
          </Link>
          <span className="mt-6 block w-fit rounded-full border border-gold/50 bg-gold/10 px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.12em] text-navy-2 uppercase">
            {post.category}
          </span>
          <h1 className="mt-4 text-3xl leading-tight sm:text-[2.35rem]">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-gold" aria-hidden /> {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-gold" aria-hidden /> {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-gold" aria-hidden /> {post.readTime}
            </span>
          </div>
          <span className="gold-rule mt-6" />

          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              width={1024}
              height={640}
              loading="lazy"
              className="mt-8 aspect-[16/9] w-full rounded-xl object-cover"
            />
          ) : null}

          <div className="mt-8 space-y-5 text-[0.95rem] leading-relaxed text-foreground/80">
            <p className="text-base font-semibold text-primary">{post.excerpt}</p>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-surface py-14 sm:py-16" aria-labelledby="related">
          <div className="container-page">
            <h2 id="related" className="text-xl">
              Related articles
            </h2>
            <span className="gold-rule mt-3" />
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner />
    </SiteLayout>
  );
}
