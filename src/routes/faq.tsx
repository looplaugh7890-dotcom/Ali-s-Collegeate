import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { CtaBanner } from "@/components/site/CtaBanner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { pageHead } from "@/lib/seo";

const faqs = [
  { q: "What classes do you offer?", a: "We offer coaching for Classes IX to XII across Science, Commerce and Arts streams, aligned with the Karachi board syllabus." },
  { q: "What are the class timings?", a: "We run morning (8-11 AM), afternoon (1-4 PM) and evening (5-8 PM) batches. Timings may vary by program." },
  { q: "How are students assessed?", a: "Weekly tests, monthly assessments and regular assignments track student progress throughout the session." },
  { q: "What is the admission process?", a: "Visit our admissions page, fill out the online form, and submit the required documents. Seats are limited." },
  { q: "Are scholarships available?", a: "Yes, merit-based and need-based fee concessions are available. Contact the administration for details." },
  { q: "How can I access the student portal?", a: "After admission, you will receive login credentials to access recorded lectures, notes, assignments and quizzes online." },
];

export const Route = createFileRoute("/faq")({
  head: () =>
    pageHead({
      title: "Frequently Asked Questions",
      description:
        "Answers about programs, batch sizes, test schedules, fees, concessions, admissions and the student portal at The Ali's Collegiate.",
      path: "/faq",
    }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Common questions from students and parents about our programs, fees and admission process."
      />
      <section className="py-16 sm:py-20">
        <div className="container-page mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-bold text-primary">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      <CtaBanner />
    </SiteLayout>
  );
}