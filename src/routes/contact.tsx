import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { pageHead } from "@/lib/seo";
import { endpoints } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      title: "Contact Us",
      description:
        "Visit the New Karachi campus of The Ali's Collegiate, call 0319-2014240 or send us a message about admissions, programs and fees.",
      path: "/contact",
    }),
  component: ContactPage,
});

const details = [
  { icon: Phone, title: "Phone", value: "0319-2014240", href: "tel:+923192014240" },
  {
    icon: Mail,
    title: "Email",
    value: "info@thealiscollegiate.edu.pk",
    href: "mailto:info@thealiscollegiate.edu.pk",
  },
  { icon: MapPin, title: "Campus", value: "New Karachi Campus, Sector 11-C, Karachi" },
  { icon: Clock, title: "Office Hours", value: "Monday — Saturday, 9:00 AM — 8:00 PM" },
];

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid phone number")
    .max(20, "Phone number is too long"),
  subject: z.string().trim().min(3, "Please add a short subject").max(150),
  message: z.string().trim().min(10, "Please add a little more detail").max(1000),
});

type Field = keyof z.infer<typeof contactSchema>;
const fieldOrder: Field[] = ["name", "email", "phone", "subject", "message"];

function ContactPage() {
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<"idle" | "valid" | "error">("idle");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(
      fieldOrder.map((f) => [f, String(form.get(f) ?? "")]),
    ) as Record<Field, string>;

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Field;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setStatus("error");
      return;
    }

    // Ready for the future Laravel endpoint: POST `${API_BASE_URL}${endpoints.contact}`
    void endpoints.contact;
    setErrors({});
    setStatus("valid");
  }

  const describe = (field: Field) => (errors[field] ? `${field}-error` : undefined);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact"
        title="Get in Touch"
        description="Have questions about admissions, fees, or timings? Call us, WhatsApp, or fill the form below."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <SectionHeading align="left" eyebrow="Reach Us" title="Campus & contact details" />
            <ul className="mt-8 space-y-4">
              {details.map(({ icon: Icon, title, value, href }) => (
                <li key={title} className="flex gap-4 rounded-xl border border-border bg-surface p-5">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-primary">{title}</span>
                    {href ? (
                      <a
                        href={href}
                        className="mt-1 block rounded-md text-sm break-words text-muted-foreground hover:text-navy-2"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="mt-1 block text-sm text-muted-foreground">{value}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <form className="card-surface p-6 sm:p-8" onSubmit={onSubmit} noValidate aria-label="Contact form">
            <h2 className="text-xl">Send us a message</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fields marked with an asterisk are required. Submission is wired up for the institute
              API and is not sent anywhere yet.
            </p>

            {status === "valid" ? (
              <p
                role="status"
                className="mt-5 flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy-2"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
                Your details passed validation. Once the API is connected this message will be
                delivered to the admissions office.
              </p>
            ) : null}
            {status === "error" ? (
              <p
                role="alert"
                className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                Please correct the highlighted fields and try again.
              </p>
            ) : null}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  maxLength={100}
                  placeholder="e.g. Ahmed Raza"
                  aria-invalid={!!errors.name}
                  aria-describedby={describe("name")}
                />
                {errors.name ? (
                  <p id="name-error" className="text-xs font-medium text-destructive">
                    {errors.name}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength={20}
                  placeholder="03XX-XXXXXXX"
                  aria-invalid={!!errors.phone}
                  aria-describedby={describe("phone")}
                />
                {errors.phone ? (
                  <p id="phone-error" className="text-xs font-medium text-destructive">
                    {errors.phone}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="email">Email address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={describe("email")}
                />
                {errors.email ? (
                  <p id="email-error" className="text-xs font-medium text-destructive">
                    {errors.email}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  maxLength={150}
                  placeholder="Admission enquiry for Class XI"
                  aria-invalid={!!errors.subject}
                  aria-describedby={describe("subject")}
                />
                {errors.subject ? (
                  <p id="subject-error" className="text-xs font-medium text-destructive">
                    {errors.subject}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  maxLength={1000}
                  placeholder="Tell us how we can help…"
                  aria-invalid={!!errors.message}
                  aria-describedby={describe("message")}
                />
                {errors.message ? (
                  <p id="message-error" className="text-xs font-medium text-destructive">
                    {errors.message}
                  </p>
                ) : null}
              </div>
            </div>
            <Button type="submit" variant="navy" size="xl" className="mt-6 w-full sm:w-auto">
              Send Message
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
