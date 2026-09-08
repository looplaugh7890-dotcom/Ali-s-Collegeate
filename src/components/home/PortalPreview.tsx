import { Link } from "@tanstack/react-router";
import { BookOpen, ClipboardList, HelpCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PortalPreview() {
  return (
    <section className="bg-primary py-16 text-primary-foreground sm:py-20">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">Student Portal</p>
          <h2 className="mt-3 text-2xl text-primary-foreground sm:text-3xl md:text-[2.1rem]">
            Learning Doesn&apos;t Stop at the Classroom
          </h2>
          <span className="gold-rule mt-5" />
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-primary-foreground/75 sm:text-base">
            Access your courses, video lessons, study materials, assignments and quizzes from
            anywhere through our student learning portal.
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              { icon: BookOpen, label: "My Subjects" },
              { icon: PlayCircle, label: "Video Lectures" },
              { icon: ClipboardList, label: "Assignments" },
              { icon: HelpCircle, label: "Quizzes" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm text-primary-foreground/85">
                <Icon className="size-4 text-gold" />
                {label}
              </li>
            ))}
          </ul>
          <Button asChild variant="gold" size="xl" className="mt-8">
            <Link to="/portal">Access Student Portal</Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground p-5 shadow-lift">
          <p className="text-sm font-bold text-primary">What You Get After Login</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Real-time access to your enrolled subjects, chapters, lectures and progress tracking.
          </p>
          <div className="mt-4 space-y-3">
            {[
              "Watch video lectures for every chapter",
              "Download notes and study materials",
              "Submit assignments online",
              "Take quizzes and track your scores",
              "View your progress and results",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground">
                <BookOpen className="size-3.5 shrink-0 text-gold" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
