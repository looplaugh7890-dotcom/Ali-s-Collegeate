import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, MessageCircle, ArrowRight, CheckCircle } from "lucide-react";

const TOUR_KEY = "tac_tutorial_seen";

export function SiteWidgets() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen) {
      timer = setTimeout(() => setShowTutorial(true), 1500);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(TOUR_KEY, "1");
  };

  return (
    <>
      {showTutorial && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-card p-8 shadow-2xl">
            <button
              onClick={closeTutorial}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <h2 className="text-xl font-bold text-primary">Welcome to The Ali&apos;s Collegiate!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Here&apos;s how to get started in 3 simple steps:
            </p>

            <ol className="mt-6 space-y-4">
              <li className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">1</span>
                <div>
                  <p className="text-sm font-semibold">Fill the Admission Form</p>
                  <p className="text-xs text-muted-foreground">Click &quot;Apply Now&quot; and complete the online form — it only takes 5 minutes.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">2</span>
                <div>
                  <p className="text-sm font-semibold">Wait for Approval</p>
                  <p className="text-xs text-muted-foreground">Our team reviews your application and confirms your admission.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">3</span>
                <div>
                  <p className="text-sm font-semibold">Get Access &amp; Start Learning</p>
                  <p className="text-xs text-muted-foreground">Once approved, log into the Student Portal to access courses, assignments, and quizzes.</p>
                </div>
              </li>
            </ol>

            <div className="mt-6 flex gap-3">
              <Link
                to="/admissions/apply"
                onClick={closeTutorial}
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-2"
              >
                <ArrowRight className="size-4" /> Apply Now
              </Link>
              <button
                onClick={closeTutorial}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      <a
        href="https://wa.me/923192014240"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
      >
        <MessageCircle className="size-7" />
      </a>
    </>
  );
}
