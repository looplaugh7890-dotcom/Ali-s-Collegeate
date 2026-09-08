import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Clock, GraduationCap, Mail, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/updates/teacher-jobs")({
  head: () =>
    pageHead({
      title: "Teacher Job Updates",
      description: "Teaching vacancies, recruitment updates and career opportunities at The Ali's Collegiate.",
      path: "/updates/teacher-jobs",
    }),
  component: TeacherJobsPage,
});

const jobListings = [
  {
    title: "Physics Teacher — Class XI & XII",
    type: "Full-time",
    deadline: "15 September 2026",
    requirements: [
      "MSc Physics or equivalent",
      "Minimum 2 years teaching experience",
      "Board exam preparation expertise",
    ],
  },
  {
    title: "Mathematics Teacher — Class IX & X",
    type: "Part-time",
    deadline: "20 September 2026",
    requirements: [
      "MSc Mathematics or BSc with relevant experience",
      "Strong command of matric syllabus",
      "Weekend availability preferred",
    ],
  },
  {
    title: "Commerce Lecturer — Accounting & Economics",
    type: "Full-time",
    deadline: "25 September 2026",
    requirements: [
      "MCom or MBA (Finance)",
      "Experience teaching intermediate commerce",
      "Board exam preparation experience",
    ],
  },
];

function TeacherJobsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Teacher Job Updates"
        title="Teaching Vacancies & Recruitment"
        description="Join our team of experienced educators. View current openings and apply."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Current Openings"
            title="Teaching Positions Available"
            subtitle="We are looking for dedicated educators to join our team."
          />
          <div className="mx-auto mt-10 max-w-3xl space-y-5">
            {jobListings.map((job) => (
              <article key={job.title} className="card-surface p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Briefcase className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-primary">{job.title}</h3>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy-2">
                          <Clock className="size-3" />
                          {job.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Deadline: {job.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 pl-14">
                  {job.requirements.map((req) => (
                    <li key={req} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-gold" />
                      {req}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pl-14">
                  <Button asChild variant="outlineNavy" size="sm">
                    <a href="mailto:info@thealiscollegiate.edu.pk?subject=Teaching Application - {job.title}">
                      Apply Now <Mail className="ml-2 size-3" />
                    </a>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-xl border border-border bg-surface p-6 text-center">
            <GraduationCap className="mx-auto size-8 text-gold" />
            <h3 className="mt-3 text-base font-bold text-primary">Don't See Your Subject?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Send your CV to our email. We keep applications on file for future openings.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Button asChild variant="navy" size="default">
                <a href="mailto:info@thealiscollegiate.edu.pk?subject=Teaching Application">
                  <Mail className="mr-2 size-4" />
                  Send Your CV
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </SiteLayout>
  );
}
