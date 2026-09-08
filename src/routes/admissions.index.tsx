import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, CheckCircle2, FileCheck, FileText, HelpCircle, IdCard, MessageSquare, Wallet } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/admissions/")({
  head: () =>
    pageHead({
      title: "Admissions",
      description: "Apply for admission at The Ali's Collegiate. Simple 4-step process with online form, document upload, and fee payment.",
      path: "/admissions",
    }),
  component: AdmissionsPage,
});

function AdmissionsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Admissions 2026-27"
        title="How to Get Admission"
        description="A simple 4-step process. Everything can be done online."
      />

      {/* Quick Actions */}
      <section className="border-b border-border bg-white py-6">
        <div className="container-page">
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="navy" size="lg">
              <Link to="/admissions/apply">
                Start Application <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outlineNavy" size="lg">
              <Link to="/admissions/status">
                Check My Status
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/contact">
                <MessageSquare className="mr-2 size-4" /> Ask a Question
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Step-by-Step Process */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Step by Step"
            title="How the Admission Process Works"
            subtitle="Follow these 4 steps. The whole process takes about 5 minutes for the online form."
          />
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: FileText,
                step: "01",
                title: "Fill Online Form",
                text: "Enter your personal details, academic record, and select your program. Takes 5 minutes.",
                detail: "You need: Name, father's name, phone, last class details, program choice.",
              },
              {
                icon: IdCard,
                step: "02",
                title: "Upload Documents",
                text: "Take photos of your result card, CNIC/B-Form, and passport photo. Upload them in the form.",
                detail: "Supported: JPG, PNG, PDF. Max 2MB each. You can also bring originals to campus.",
              },
              {
                icon: Wallet,
                step: "03",
                title: "Pay Admission Fee",
                text: "Pay Rs. 6,500 online via card (Stripe) or pay cash at campus. Seat is confirmed on payment.",
                detail: "Online payment is instant. Cash payment: visit campus with fee, bring your application number.",
              },
              {
                icon: FileCheck,
                step: "04",
                title: "Get Confirmation",
                text: "We review your application within 2-3 days. You get an email with login credentials for the student portal.",
                detail: "After login, you can access courses, video lessons, assignments and study material.",
              },
            ].map((s) => (
              <li key={s.step} className="card-surface group relative p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-navy-2 transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
                    <s.icon className="size-5" />
                  </span>
                  <span className="text-2xl font-extrabold text-gold">{s.step}</span>
                </div>
                <h3 className="mt-4 text-base font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                <p className="mt-2 text-xs text-gold font-medium">{s.detail}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Button asChild variant="navy" size="xl">
              <Link to="/admissions/apply">
                Start Your Application <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What You Need */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="Documents" title="What You Need to Have Ready" />
            <p className="mt-3 text-sm text-muted-foreground">
              Keep these ready before starting the application. You can upload them online or bring photocopies to campus.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: FileText, text: "Previous class result card or marksheet" },
                { icon: IdCard, text: "Your CNIC or B-Form copy" },
                { icon: IdCard, text: "Guardian's CNIC copy" },
                { icon: FileText, text: "Two passport-size photographs" },
                { icon: FileCheck, text: "School leaving certificate (if you have it)" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                  <Icon className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span className="text-foreground/80">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading align="left" eyebrow="Dates" title="Important Dates" />
            <p className="mt-3 text-sm text-muted-foreground">
              Keep track of these deadlines. Apply early to secure your seat.
            </p>
            <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
              {[
                { label: "Applications open", value: "1 August 2026", highlight: true },
                { label: "Last date to apply", value: "30 September 2026" },
                { label: "Orientation session", value: "5 October 2026" },
                { label: "Classes start", value: "8 October 2026", highlight: true },
              ].map((d) => (
                <li key={d.label} className="flex items-center justify-between gap-4 px-5 py-4">
                  <span className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-primary">
                    <CalendarDays className="size-4 shrink-0 text-gold" />
                    <span className="truncate">{d.label}</span>
                  </span>
                  <span className={`shrink-0 text-sm font-semibold ${d.highlight ? "text-gold" : "text-muted-foreground"}`}>{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Questions?"
            title="Frequently Asked Questions"
            subtitle="Can't find your answer? Call us at +92-319-2014240"
          />
          <div className="mx-auto mt-10 max-w-3xl space-y-4">
            {[
              { q: "What is the fee?", a: "Rs. 6,500 per month. Admission fee is also Rs. 6,500 (one-time). Total first month: Rs. 13,000." },
              { q: "Can I pay online?", a: "Yes. We accept card payments through Stripe. You can also pay cash at campus." },
              { q: "What if I miss the deadline?", a: "Contact us. We sometimes accept late applications if seats are available." },
              { q: "Do you offer scholarships?", a: "Yes. Merit-based scholarships for students scoring 80%+ in their last exam. Ask at admission." },
              { q: "What are the class timings?", a: "Morning batch: 7 AM - 10 AM. Evening batch: 4 PM - 7 PM. You choose at enrollment." },
              { q: "Can I change my program later?", a: "Yes, within the first 2 weeks. Talk to the admin office." },
            ].map((faq) => (
              <div key={faq.q} className="card-surface p-5">
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 size-5 shrink-0 text-gold" />
                  <div>
                    <h3 className="text-sm font-bold text-primary">{faq.q}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </SiteLayout>
  );
}
