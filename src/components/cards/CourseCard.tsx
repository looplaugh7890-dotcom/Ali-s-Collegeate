import { Link } from "@tanstack/react-router";
import { BookOpen, Clock, SignalHigh, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Course } from "@/types";

export function CourseCard({
  course,
  showProgress = false,
  href = "public",
}: {
  course: Course;
  showProgress?: boolean;
  /** `public` links to the marketing detail page, `portal` to the learning page. */
  href?: "public" | "portal";
}) {
  return (
    <article className="card-surface group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden bg-primary">
        <img
          src={course.image}
          alt={`${course.title} course`}
          width={1024}
          height={640}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 left-3 rounded-full bg-primary/90 px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.12em] text-gold uppercase backdrop-blur">
          {course.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base leading-snug font-bold">{course.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-foreground/70">
          <li className="flex items-center gap-1.5">
            <User className="size-3.5 text-gold" aria-hidden />
            {course.instructor}
          </li>
          <li className="flex items-center gap-1.5">
            <SignalHigh className="size-3.5 text-gold" aria-hidden />
            {course.level}
          </li>
          <li className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-gold" aria-hidden />
            {course.duration}
          </li>
          <li className="flex items-center gap-1.5">
            <BookOpen className="size-3.5 text-gold" aria-hidden />
            {course.lessons} lessons
          </li>
        </ul>
        {showProgress ? (
          <div className="mt-4">
            <ProgressBar value={course.progress} label="Course progress" />
          </div>
        ) : null}
        <div className="mt-5 flex-1" />
        <Button asChild variant="outlineNavy" className="w-full">
          {href === "portal" ? (
            <Link to="/portal/courses/$slug" params={{ slug: course.slug }}>
              {course.progress > 0 ? "Continue Learning" : "Start Course"}
            </Link>
          ) : (
            <Link to="/courses/$slug" params={{ slug: course.slug }}>
              View Course
            </Link>
          )}
        </Button>
      </div>
    </article>
  );
}
