import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Star, Users, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,oklch(0.38_0.099_261/0.06),transparent_65%)]"
      />
      <div className="container-page relative py-16 text-center sm:py-20 lg:py-24">
        <div className="reveal mx-auto max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] text-navy-2 uppercase">
            <span className="gold-rule !w-6" />
            The Ali&apos;s Collegiate
            <span className="gold-rule !w-6" />
          </p>
          <h1 className="mt-5 text-[2rem] leading-[1.1] sm:text-[2.6rem] lg:text-[3.1rem]">
            A Complete Ecosystem for Students & Teachers
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Empowering students and teachers with the knowledge, tools, resources,
            and opportunities they need to learn, grow, and move forward.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="navy" size="xl">
              <Link to="/admissions/apply">
                <ArrowRight className="mr-2 size-4" />
                Apply Now
              </Link>
            </Button>
            <Button asChild variant="gold" size="xl">
              <a
                href="https://wa.me/923192014240"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 size-4" />
                WhatsApp Us
              </a>
            </Button>
          </div>
        </div>

        <ul className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Users, label: "Expert Faculty" },
            { icon: BookOpen, label: "Weekly Tests" },
            { icon: Star, label: "Small Batches" },
            { icon: Award, label: "Affordable Fees" },
          ].map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3.5"
            >
              <Icon className="size-4 shrink-0 text-gold" />
              <span className="text-sm font-semibold text-primary">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
