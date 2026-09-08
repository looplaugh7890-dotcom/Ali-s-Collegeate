import { Award, ClipboardCheck, Compass, HeartHandshake, Users, Wallet } from "lucide-react";
import whyImage from "@/assets/why-choose.jpg";

const points = [
  { icon: Award, title: "Experienced Faculty", text: "Subject specialists with years of board-exam teaching experience." },
  { icon: ClipboardCheck, title: "Regular Assessments", text: "Weekly tests, monthly exams and transparent progress reports." },
  { icon: Users, title: "Individual Attention", text: "Small batches so no student is left behind on a concept." },
  { icon: Wallet, title: "Affordable Fees", text: "Transparent fee structure with merit and need-based concessions." },
  { icon: Compass, title: "Career Guidance", text: "Stream selection, entry-test orientation and counselling sessions." },
  { icon: HeartHandshake, title: "Supportive Environment", text: "A disciplined, respectful campus culture that students enjoy." },
];

export function WhyChooseUs() {
  return (
    <section className="bg-surface py-16 sm:py-20">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <div className="relative order-2 lg:order-1">
          <div className="overflow-hidden rounded-2xl border border-border shadow-card">
            <img
              src={whyImage}
              alt="A teacher guiding a small group of students around a study table"
              loading="lazy"
              width={1200}
              height={1008}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -right-2 -bottom-6 rounded-xl border border-border bg-card px-5 py-4 shadow-lift sm:right-6">
            <p className="text-2xl font-extrabold text-gold">Since 2018</p>
            <p className="text-xs font-semibold text-muted-foreground">Serving New Karachi students</p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-xs font-bold tracking-[0.2em] text-navy-2 uppercase">Why Choose Us</p>
          <h2 className="mt-3 text-2xl sm:text-3xl md:text-[2.1rem]">
            Why Choose The Ali&apos;s Collegiate?
          </h2>
          <span className="gold-rule mt-4" />
          <ul className="mt-7 grid gap-5 sm:grid-cols-2">
            {points.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold/40 bg-gold/10 text-navy-2">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-primary">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}