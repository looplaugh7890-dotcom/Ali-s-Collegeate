import { createFileRoute } from "@tanstack/react-router";
import { Award, Eye, Flag, HeartHandshake, Target, Users } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBanner } from "@/components/site/CtaBanner";
import { InfoCard } from "@/components/cards/InfoCard";
import { pageHead } from "@/lib/seo";
import whyImage from "@/assets/why-choose.jpg";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About Us",
      description:
        "Since 2018, The Ali's Collegiate has coached students of Classes IX to XII in New Karachi with experienced faculty, small batches and regular assessment.",
      path: "/about",
    }),
  component: AboutPage,
});

const values = [
  { icon: Target, title: "Academic Focus", description: "Every class is planned around clear learning outcomes and board requirements." },
  { icon: Users, title: "Individual Attention", description: "Batch sizes stay small so teachers know each student's strengths and gaps." },
  { icon: HeartHandshake, title: "Character Building", description: "Discipline, respect and responsibility are taught alongside the syllabus." },
  { icon: Award, title: "Consistent Results", description: "Regular assessment cycles turn effort into measurable improvement." },
];

const milestones = [
  { year: "2018", text: "The Ali's Collegiate opens its New Karachi campus with matric coaching classes." },
  { year: "2020", text: "Intermediate programs introduced across Science, Commerce and Arts groups." },
  { year: "2023", text: "Computer and English language short courses added for skill development." },
  { year: "2026", text: "Student learning portal introduced for lessons, assignments and resources." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="About Us"
        title="A coaching institute built on teaching, not shortcuts"
        description="The Ali's Collegiate is committed to academic excellence, character building and bright futures for every student who walks through our doors."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border shadow-card">
            <img
              src={whyImage}
              alt="Faculty member guiding students at The Ali's Collegiate"
              loading="lazy"
              width={1200}
              height={1008}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <SectionHeading
              align="left"
              eyebrow="Our Story"
              title="Passion for Victory, since 2018"
              subtitle="We started with a simple belief: students perform best when someone is genuinely paying attention to their progress. That belief still shapes our batch sizes, our test schedule and the way our faculty teach."
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-5">
                <Flag className="size-5 text-gold" />
                <h3 className="mt-3 text-sm font-bold">Our Mission</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  To deliver affordable, high-quality coaching that helps every student reach their
                  academic potential with confidence.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-5">
                <Eye className="size-5 text-gold" />
                <h3 className="mt-3 text-sm font-bold">Our Vision</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  To be the most trusted coaching institute in New Karachi for academic results and
                  student care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Our Values" title="What we stand for" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <InfoCard key={v.title} {...v} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Milestones" title="How we have grown" />
          <ol className="mx-auto mt-10 max-w-3xl border-l border-border pl-6">
            {milestones.map((m) => (
              <li key={m.year} className="relative pb-8 last:pb-0">
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-[1.72rem] h-3 w-3 rounded-full border-2 border-gold bg-background"
                />
                <p className="text-sm font-extrabold text-navy-2">{m.year}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBanner />
    </SiteLayout>
  );
}