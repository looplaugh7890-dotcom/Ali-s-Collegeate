import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  BookMarked,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Phone,
  Mail,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Hero } from "@/components/home/Hero";
import { AnnouncementCard } from "@/components/cards/AnnouncementCard";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Announcement, Testimonial } from "@/types";

const title = "The Ali's Collegiate — Coaching Classes IX to XII in Karachi";
const description =
  "Premium coaching for Classes IX-XII in Science, Commerce and Arts with experienced faculty, weekly tests, individual attention and affordable fees.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const quickAccessCards = [
  { icon: BookOpen, title: "Notes & Study Materials", desc: "Notes, study material and downloads", link: "/resources" },
  { icon: FileText, title: "Past Papers", desc: "Previous papers and preparation", link: "/resources" },
  { icon: Calendar, title: "Exam Schedule", desc: "Upcoming exams and dates", link: "/resources" },
  { icon: Award, title: "Scholarships", desc: "Opportunities, eligibility and deadlines", link: "/resources" },
  { icon: GraduationCap, title: "Admissions", desc: "Admission information and application", link: "/admissions" },
  { icon: LayoutDashboard, title: "Student Portal", desc: "Direct portal/login access", link: "/portal" },
];

const infoCards = [
  { icon: BookMarked, title: "TAC Academic Updates", desc: "Academic notices, tests and academic information", link: "/updates/academic", color: "bg-blue-50 text-blue-600" },
  { icon: Megaphone, title: "Official Updates", desc: "Official institute announcements and notices", link: "/updates/official", color: "bg-amber-50 text-amber-600" },
  { icon: Briefcase, title: "Teacher Job Updates", desc: "Teaching vacancies and recruitment updates", link: "/updates/teacher-jobs", color: "bg-emerald-50 text-emerald-600" },
  { icon: LayoutDashboard, title: "Student Portal", desc: "Direct access to the student portal", link: "/portal", color: "bg-purple-50 text-purple-600" },
];

function Index() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    api.getAnnouncements().then(setAnnouncements);
    api.getTestimonials().then(setTestimonials);
  }, []);

  return (
    <SiteLayout>
      <Hero />

      {/* Quick Access — 6 Cards */}
      <section className="border-b border-border bg-white py-12 sm:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Quick Access"
            title="What Are You Looking For?"
            subtitle="Find the resources, information and services you need."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickAccessCards.map((card) => (
              <Link
                key={card.title}
                to={card.link}
                className="group flex items-start gap-4 rounded-xl border border-border bg-surface p-5 transition-all hover:border-gold hover:bg-gold/5 hover:shadow-lift"
              >
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
                  <card.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary">{card.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Important Information & Updates */}
      <section className="py-12 sm:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Stay Informed"
            title="Important Information & Updates"
            subtitle="Stay up to date with academic notices, official announcements and opportunities."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {infoCards.map((card) => (
              <Link
                key={card.title}
                to={card.link}
                className="card-surface group flex h-full flex-col p-6"
              >
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${card.color} transition-transform group-hover:scale-105`}>
                  <card.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-primary">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold group-hover:underline">
                  View Details →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-surface py-12 sm:py-16">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="About Us"
              title="A Coaching Institute Built on Teaching, Not Shortcuts"
              subtitle="Since 2018, The Ali's Collegiate has been helping students in New Karachi achieve their academic goals through experienced faculty, small batches and genuine individual attention."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="navy" size="lg">
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: "Students Coached", value: "500+" },
              { icon: Star, label: "Success Rate", value: "95%" },
              { icon: GraduationCap, label: "Expert Faculty", value: "12+" },
              { icon: CheckCircle2, label: "Years of Service", value: "8+" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-5 text-center shadow-card">
                <Icon className="mx-auto size-6 text-gold" />
                <p className="mt-2 text-2xl font-extrabold text-primary">{value}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Portal */}
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">Student Portal</p>
            <h2 className="mt-3 text-2xl text-primary-foreground sm:text-3xl">
              Everything You Need, Online
            </h2>
            <span className="gold-rule mt-5" />
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-primary-foreground/75 sm:text-base">
              After admission, you get access to our student portal. Study from anywhere.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Watch recorded video lessons for every subject",
                "Download notes, worksheets and past papers",
                "Submit assignments online and get feedback",
                "Take quizzes and track your scores",
                "See your progress report anytime",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-primary-foreground/85">
                  <CheckCircle2 className="size-4 shrink-0 text-gold" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="xl">
                <Link to="/portal/login">
                  Student Login →
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground p-5 shadow-lift">
            <p className="text-sm font-bold text-primary">What You Get After Login</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Video Lessons", value: "100+" },
                { label: "Study Notes", value: "50+" },
                { label: "Practice Tests", value: "30+" },
                { label: "Subjects", value: "6" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xl font-extrabold text-gold">{s.value}</p>
                  <p className="text-[0.7rem] font-semibold text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories / Testimonials */}
      <section className="py-12 sm:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Success Stories"
            title="What Our Students Say"
            subtitle="Hear from students and parents about their experience at The Ali's Collegiate."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="bg-surface py-12 sm:py-16">
          <div className="container-page">
            <SectionHeading
              eyebrow="News"
              title="Latest Announcements"
              subtitle="Important updates from the administration."
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {announcements.map((a) => (
                <AnnouncementCard key={a.id} {...a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Quick */}
      <section className="py-12 sm:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Contact"
            title="Get in Touch"
            subtitle="Have questions? Here is how to reach us."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              { icon: Phone, title: "Call / WhatsApp", value: "+92-319-2014240", desc: "9 AM to 7 PM, Monday to Saturday" },
              { icon: Mail, title: "Email", value: "info@thealiscollegiate.edu.pk", desc: "We reply within 24 hours" },
              { icon: MapPin, title: "Visit Campus", value: "New Karachi, Karachi", desc: "Google Maps: The Ali's Collegiate" },
            ].map(({ icon: Icon, title, value, desc }) => (
              <div key={title} className="card-surface p-6 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-primary">{title}</h3>
                <p className="mt-1 text-sm font-semibold text-gold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="navy" size="xl">
              <Link to="/contact">
                Send Us a Message →
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaBanner />
    </SiteLayout>
  );
}
