import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ClipboardList, FileText, HelpCircle, LogIn, Trophy, UserPlus } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { InfoCard } from "@/components/cards/InfoCard";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/portal/")({
  head: () =>
    pageHead({
      title: "Student Portal",
      description:
        "The Ali's Collegiate student portal: access courses, video lessons, study materials, assignments, quizzes and results in one place.",
      path: "/portal",
    }),
  component: PortalLanding,
});

const features = [
  { icon: BookOpen, title: "My Courses", description: "Continue lessons where you left off with visible progress tracking." },
  { icon: FileText, title: "Study Materials", description: "Chapter notes, worksheets and past papers for your enrolled subjects." },
  { icon: ClipboardList, title: "Assignments", description: "See what is due, submit work and review teacher feedback." },
  { icon: HelpCircle, title: "Quizzes", description: "Practice chapter quizzes and timed tests before each assessment." },
  { icon: Trophy, title: "Results", description: "Weekly test and monthly exam results with subject-wise breakdown." },
];

function PortalLanding() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Student Portal"
        title="Your classroom, available anywhere"
        description="Enrolled students can sign in to access lessons, materials, assignments, quizzes and results."
      />
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Inside the Portal" title="Everything in one place" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {features.map((f) => (
              <InfoCard key={f.title} {...f} />
            ))}
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Button asChild variant="navy" size="xl">
              <Link to="/portal/login">
                <LogIn className="size-4" /> Student Login
              </Link>
            </Button>
            <Button asChild variant="outlineNavy" size="xl">
              <Link to="/portal/register">
                <UserPlus className="size-4" /> Create Account
              </Link>
            </Button>
            <Button asChild variant="gold" size="xl">
              <Link to="/portal/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}