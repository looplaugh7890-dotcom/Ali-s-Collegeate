import { useEffect, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  ClipboardList,
  Clock,
  FileText,
  HelpCircle,
  PlayCircle,
  SignalHigh,
  X,
  Download,
} from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { pageHead } from "@/lib/seo";
import { api } from "@/lib/api";
import type { Course, Module, Lesson } from "@/types";

export const Route = createFileRoute("/portal/courses/$slug")({
  head: ({ params }) =>
    pageHead({
      title: "Course",
      description: "Course learning page.",
      path: `/portal/courses/${params.slug}`,
    }),
  component: () => (
    <AuthGuard requiredRole="student">
      <LearningPage />
    </AuthGuard>
  ),
});

const typeIcon: Record<string, typeof PlayCircle> = {
  Video: PlayCircle,
  PDF: FileText,
  DOCX: FileText,
  TXT: FileText,
  Quiz: HelpCircle,
  Assignment: ClipboardList,
};

function LessonViewer({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-bold">{lesson.title}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>
      <div className="p-5">
        {lesson.type === "Video" && lesson.videoUrl && (
          <div className="aspect-video w-full">
            <iframe
              src={lesson.videoUrl}
              className="h-full w-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          </div>
        )}
        {lesson.type === "Video" && !lesson.videoUrl && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <PlayCircle className="size-12 mb-3" />
            <p className="text-sm">No video URL provided for this lesson.</p>
          </div>
        )}
        {lesson.type === "PDF" && lesson.fileUrl && (
          <div className="flex flex-col items-center justify-center py-8">
            <FileText className="size-16 mb-4 text-primary" />
            <p className="text-sm font-medium mb-1">{lesson.title}</p>
            <p className="text-xs text-muted-foreground mb-4">PDF Document</p>
            <div className="flex gap-3">
              <Button variant="navy" size="sm" asChild>
                <a href={lesson.fileUrl} target="_blank" rel="noopener noreferrer">
                  <PlayCircle className="size-4 mr-2" /> Open
                </a>
              </Button>
              <Button variant="outlineNavy" size="sm" asChild>
                <a href={lesson.fileUrl} download>
                  <Download className="size-4 mr-2" /> Download
                </a>
              </Button>
            </div>
          </div>
        )}
        {lesson.type === "PDF" && !lesson.fileUrl && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="size-12 mb-3" />
            <p className="text-sm">No PDF file uploaded for this lesson.</p>
          </div>
        )}
        {(lesson.type === "DOCX" || lesson.type === "TXT") && lesson.fileUrl && (
          <div className="flex flex-col items-center justify-center py-8">
            <FileText className="size-16 mb-4 text-primary" />
            <p className="text-sm font-medium mb-1">{lesson.title}</p>
            <p className="text-xs text-muted-foreground mb-4">{lesson.type} document</p>
            <div className="flex gap-3">
              <Button variant="navy" size="sm" asChild>
                <a href={lesson.fileUrl} target="_blank" rel="noopener noreferrer">
                  <PlayCircle className="size-4 mr-2" /> Open
                </a>
              </Button>
              <Button variant="outlineNavy" size="sm" asChild>
                <a href={lesson.fileUrl} download>
                  <Download className="size-4 mr-2" /> Download
                </a>
              </Button>
            </div>
          </div>
        )}
        {(lesson.type === "DOCX" || lesson.type === "TXT") && !lesson.fileUrl && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="size-12 mb-3" />
            <p className="text-sm">No file uploaded for this lesson.</p>
          </div>
        )}
        {lesson.content && (
          <div className="mt-4 rounded-lg bg-surface p-4">
            <p className="text-sm whitespace-pre-wrap">{lesson.content}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LearningPage() {
  const { slug } = Route.useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getCourse(slug),
      api.getCourseModules(slug),
    ]).then(([c, m]) => {
      if (!c) setNotFoundState(true);
      else {
        setCourse(c);
        setModules(m);
      }
    }).catch(() => setNotFoundState(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PortalShell title="Loading..." description="Loading course content">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PortalShell>
    );
  }

  if (notFoundState || !course) {
    throw notFound();
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <PortalShell title={course.title} description={`${course.category} · ${course.level}`}>
      <div className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-8">
            {selectedLesson && (
              <LessonViewer lesson={selectedLesson} onClose={() => setSelectedLesson(null)} />
            )}
            <section aria-labelledby="chapters">
              <h2 id="chapters" className="text-lg">
                Chapters & Lectures
              </h2>
              <div className="mt-4 space-y-4">
                {modules.map((m, idx) => (
                  <div key={m.id} className="rounded-xl border border-border bg-card">
                    <div className="border-b border-border px-5 py-3.5">
                      <h3 className="text-sm font-bold">Chapter {idx + 1}: {m.title}</h3>
                      {m.summary ? (
                        <p className="mt-1 text-xs text-muted-foreground">{m.summary}</p>
                      ) : null}
                    </div>
                    <ul>
                      {m.lessons.map((l) => {
                        const Icon = typeIcon[l.type] ?? FileText;
                        return (
                          <li
                            key={l.id}
                            className="flex items-center gap-3 border-b border-border px-5 py-3.5 last:border-0 cursor-pointer hover:bg-surface/50 transition-colors"
                            onClick={() => setSelectedLesson(l)}
                          >
                            <Icon className="size-4 shrink-0 text-gold" aria-hidden />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-foreground">
                                {l.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {l.type}{l.duration ? ` · ${l.duration}` : ""}
                              </span>
                            </span>
                            <Button variant="ghost" size="sm" className="shrink-0" onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLesson(l);
                            }}>
                              Open
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
                {modules.length === 0 && (
                  <p className="text-sm text-muted-foreground">Chapters will be available soon.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="card-surface p-6">
              <h2 className="text-base font-bold">Course Progress</h2>
              <div className="mt-4">
                <ProgressBar value={course.progress} label="Lessons completed" />
              </div>
              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4 text-gold" aria-hidden />
                  <dt className="sr-only">Duration</dt>
                  <dd>{course.duration || "Self-paced"}</dd>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <SignalHigh className="size-4 text-gold" aria-hidden />
                  <dt className="sr-only">Level</dt>
                  <dd>{course.level || "All levels"}</dd>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="size-4 text-gold" aria-hidden />
                  <dt className="sr-only">Chapters</dt>
                  <dd>{modules.length} chapters &middot; {totalLessons} lectures</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </PortalShell>
  );
}
