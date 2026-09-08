import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { Logo } from "./Logo";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "TAC Academic Updates", to: "/updates/academic" },
  { label: "Official Updates", to: "/updates/official" },
  { label: "Teacher Job Updates", to: "/updates/teacher-jobs" },
  { label: "Admissions", to: "/admissions" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
] as const;

const supportLinks = [
  { label: "Student Portal", to: "/portal" },
  { label: "Notes & Study Materials", to: "/resources" },
  { label: "Past Papers", to: "/resources" },
  { label: "Exam Schedule", to: "/resources" },
  { label: "Scholarships", to: "/resources" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="rounded-xl bg-primary-foreground/95 p-3">
            <Logo />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/75">
            The Ali&apos;s Collegiate delivers focused coaching for Classes IX to XII along with
            computer and English language courses — built on experienced faculty, regular
            assessment and genuine individual attention.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { icon: Facebook, href: "https://www.facebook.com/share/193evonRzw/", label: "Facebook" },
              { icon: Instagram, href: "https://www.facebook.com/share/193evonRzw/", label: "Instagram" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/25 transition-colors hover:border-gold hover:text-gold"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Quick links">
          <h3 className="text-sm font-bold tracking-[0.15em] text-gold uppercase">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-primary-foreground/80 transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Student support">
          <h3 className="text-sm font-bold tracking-[0.15em] text-gold uppercase">Student Resources</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {supportLinks.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-primary-foreground/80 transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-bold tracking-[0.15em] text-gold uppercase">Contact</h3>
          <ul className="mt-4 space-y-3.5 text-sm text-primary-foreground/80">
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href="tel:+923192014240" className="hover:text-gold">
                0319-2014240
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href="mailto:info@thealiscollegiate.edu.pk" className="break-all hover:text-gold">
                info@thealiscollegiate.edu.pk
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              <span>New Karachi Campus, Sector 11-C, Karachi, Pakistan</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-primary-foreground/65 sm:flex-row">
          <p>&copy; 2026 The Ali&apos;s Collegiate. All Rights Reserved.</p>
          <p>Since 2018 &middot; Passion for Victory</p>
        </div>
      </div>
    </footer>
  );
}
