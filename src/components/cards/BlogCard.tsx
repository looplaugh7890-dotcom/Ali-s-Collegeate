import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Clock, User } from "lucide-react";
import type { BlogPost } from "@/types";

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article
      className={`card-surface group flex h-full flex-col overflow-hidden ${featured ? "md:flex-row" : ""}`}
    >
      {post.image ? (
        <div className={`overflow-hidden bg-surface ${featured ? "md:w-1/2" : ""}`}>
          <img
            src={post.image}
            alt={post.title}
            width={1024}
            height={640}
            loading="lazy"
            className="aspect-[16/9] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}
      <div className={`flex flex-1 flex-col p-6 ${featured ? "md:justify-center" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-fit rounded-full border border-gold/50 bg-gold/10 px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.12em] text-navy-2 uppercase">
            {post.category}
          </span>
          {featured ? (
            <span className="w-fit rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.12em] text-primary-foreground uppercase">
              Featured
            </span>
          ) : null}
        </div>
        <h3 className={`mt-4 font-bold ${featured ? "text-xl sm:text-2xl" : "text-lg"}`}>
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="rounded-md hover:text-navy-2"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-gold" aria-hidden /> {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-gold" aria-hidden /> {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-gold" aria-hidden /> {post.readTime}
            </span>
          </span>
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-primary hover:text-navy-2"
          >
            Read more
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
