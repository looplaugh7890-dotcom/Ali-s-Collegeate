import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground sm:py-20">
      <div aria-hidden className="absolute -top-20 left-1/4 h-64 w-64 rounded-full border border-gold/20" />
      <div aria-hidden className="absolute -bottom-24 right-1/5 h-72 w-72 rounded-full border border-primary-foreground/10" />
      <div className="container-page relative text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">Admissions Open 2026-27</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-2xl text-primary-foreground sm:text-3xl md:text-[2.2rem]">
          Ready to Improve Your Grades?
        </h2>
        <span className="gold-rule mx-auto mt-5" />
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-primary-foreground/75 sm:text-base">
          Apply online in 5 minutes. Admission fee Rs. 6,500. Classes start 8 October 2026.
          Still have questions? Call us or send a WhatsApp message.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="gold" size="xl">
            <Link to="/admissions/apply">
              Apply Now <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="onNavy" size="xl">
            <Link to="/contact">
              <Phone className="mr-2 size-4" /> Call / WhatsApp
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
