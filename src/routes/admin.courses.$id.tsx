import { useEffect, useState, useCallback } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileText,
  HelpCircle,
  ClipboardList,
  GripVertical,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader, FilePreview } from "@/components/portal/FileUploader";
import { pageHead } from "@/lib/seo";
import { apiClient, endpoints } from "@/lib/api-client";

export const Route = createFileRoute("/admin/courses/$id")({
  head: () => pageHead({ title: "Course Builder", description: "Build and manage course content.", path: "/admin/courses/$id" }),
  component: () => (
    <AuthGuard requiredRole="admin">
      <CourseBuilderPage />
    </AuthGuard>
  ),
});

interface Lesson {
  _id: string;
  title: string;
  type: "Video" | "PDF" | "DOCX" | "TXT" | "Quiz" | "Assignment";
  duration?: string;
  videoUrl?: string;
  pdfUrl?: string;
  fileUrl?: string;
  content?: string;
  order: number;
  isPublished: boolean;
}

interface Module {
  _id: string;
  title: string;
  summary?: string;
  order: number;
  lessons: Lesson[];
}

interface CourseData {
  _id: string;
  slug: string;
  title: string;
  program: string;
  category: string;
  instructor: string;
  duration: string;
  level: string;
  description: string;
  imageUrl: string;
  fee: number;
  isPublished: boolean;
  modules: Module[];
}

interface AssignmentData {
  _id: string;
  title: string;
  instructions?: string;
  dueDate?: string;
  totalMarks: number;
  isPublished: boolean;
  course?: string;
}

interface QuizData {
  _id: string;
  title: string;
  durationMinutes: number;
  questions: Array<{ _id: string; question: string; options: string[]; correctAnswer: number; marks: number }>;
  isPublished: boolean;
}

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

function CourseBuilderPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"modules" | "assignments" | "info">("modules");

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleSummary, setNewModuleSummary] = useState("");
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState<"Video" | "PDF" | "DOCX" | "TXT">("Video");
  const [newLessonDuration, setNewLessonDuration] = useState("");
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState("");
  const [newLessonFileUrl, setNewLessonFileUrl] = useState("");
  const [newLessonFileName, setNewLessonFileName] = useState("");
  const [newLessonPublished, setNewLessonPublished] = useState(true);

  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: "", instructions: "", dueDate: "", totalMarks: "20" });

  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizDuration, setNewQuizDuration] = useState("20");
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Record<string, QuizQuestion[]>>({});
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionOptions, setNewQuestionOptions] = useState(["", "", "", ""]);
  const [newQuestionAnswer, setNewQuestionAnswer] = useState(0);
  const [newQuestionMarks, setNewQuestionMarks] = useState("1");
  const [addQuestionQuizId, setAddQuestionQuizId] = useState<string | null>(null);

  const [editCourseMode, setEditCourseMode] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    program: "",
    category: "",
    instructor: "",
    duration: "",
    level: "",
    description: "",
    imageUrl: "",
    fee: "0",
    isPublished: false,
  });

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiClient.get<CourseData>(endpoints.courses.adminDetail(id)),
      apiClient.get<AssignmentData[]>(`${endpoints.admin.assignments}?course=${id}`),
      apiClient.get<QuizData[]>(`${endpoints.admin.quizzes}?course=${id}`),
    ])
      .then(([c, a, q]) => {
        setCourse(c);
        setAssignments(Array.isArray(a) ? a : []);
        setQuizzes(Array.isArray(q) ? q : []);
      })
      .catch((err) => {
        console.error("Failed to load course:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (course) {
      setCourseForm({
        title: course.title,
        slug: course.slug,
        program: course.program || "",
        category: course.category || "",
        instructor: course.instructor || "",
        duration: course.duration || "",
        level: course.level || "",
        description: course.description || "",
        imageUrl: course.imageUrl || "",
        fee: String(course.fee || 0),
        isPublished: course.isPublished,
      });
    }
  }, [course]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(endpoints.courses.modulesAdd(id), {
        title: newModuleTitle,
        summary: newModuleSummary,
      });
      setNewModuleTitle("");
      setNewModuleSummary("");
      setShowAddModule(false);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Delete this chapter and all its lessons?")) return;
    try {
      await apiClient.delete(endpoints.courses.moduleDelete(id, moduleId));
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLesson = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    try {
      const payload: Record<string, unknown> = {
        title: newLessonTitle,
        type: newLessonType,
        duration: newLessonDuration,
        isPublished: newLessonPublished,
      };
      if (newLessonType === "Video") {
        payload["videoUrl"] = newLessonVideoUrl;
      } else {
        payload["fileUrl"] = newLessonFileUrl;
      }
      await apiClient.post(endpoints.courses.lessonsAdd(id, moduleId), payload);
      setNewLessonTitle("");
      setNewLessonDuration("");
      setNewLessonVideoUrl("");
      setNewLessonFileUrl("");
      setNewLessonFileName("");
      setNewLessonPublished(true);
      setAddLessonModuleId(null);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await apiClient.delete(endpoints.courses.lessonDelete(id, moduleId, lessonId));
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/courses/${id}`, {
        ...courseForm,
        fee: parseInt(courseForm.fee) || 0,
      });
      setEditCourseMode(false);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(endpoints.admin.assignments, {
        title: newAssignment.title,
        instructions: newAssignment.instructions,
        dueDate: newAssignment.dueDate || undefined,
        totalMarks: parseInt(newAssignment.totalMarks),
        course: id,
      });
      setNewAssignment({ title: "", instructions: "", dueDate: "", totalMarks: "20" });
      setShowAddAssignment(false);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Delete this assignment?")) return;
    try {
      await apiClient.delete(`${endpoints.admin.assignments}/${assignmentId}`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(endpoints.admin.quizzes, {
        title: newQuizTitle,
        durationMinutes: parseInt(newQuizDuration),
        course: id,
        questions: [],
      });
      setNewQuizTitle("");
      setNewQuizDuration("20");
      setShowAddQuiz(false);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Delete this quiz?")) return;
    try {
      await apiClient.delete(`${endpoints.admin.quizzes}/${quizId}`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const loadQuizQuestions = async (quizId: string) => {
    try {
      const questions = await apiClient.get<QuizQuestion[]>(endpoints.admin.quizQuestions(quizId));
      setQuizQuestions((prev) => ({ ...prev, [quizId]: Array.isArray(questions) ? questions : [] }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleQuizExpand = async (quizId: string) => {
    if (expandedQuizId === quizId) {
      setExpandedQuizId(null);
    } else {
      setExpandedQuizId(quizId);
      if (!quizQuestions[quizId]) {
        await loadQuizQuestions(quizId);
      }
    }
  };

  const handleAddQuestion = async (e: React.FormEvent, quizId: string) => {
    e.preventDefault();
    try {
      await apiClient.post(endpoints.admin.quizQuestions(quizId), {
        question: newQuestionText,
        options: newQuestionOptions,
        correctAnswer: newQuestionAnswer,
        marks: parseInt(newQuestionMarks),
      });
      setNewQuestionText("");
      setNewQuestionOptions(["", "", "", ""]);
      setNewQuestionAnswer(0);
      setNewQuestionMarks("1");
      setAddQuestionQuizId(null);
      await loadQuizQuestions(quizId);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (quizId: string, qId: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await apiClient.delete(endpoints.admin.quizQuestion(quizId, qId));
      await loadQuizQuestions(quizId);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Course Builder" description="Loading...">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      </AdminShell>
    );
  }

  if (!course) {
    return (
      <AdminShell title="Course Builder" description="Course not found">
        <div className="card-surface p-12 text-center">
          <p className="text-muted-foreground mb-4">Course not found.</p>
          <Button variant="navy" onClick={() => navigate({ to: "/admin/courses" })}>
            <ArrowLeft className="size-4 mr-2" /> Back to Courses
          </Button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={course.title} description="Course Builder">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/courses" })}>
            <ArrowLeft className="size-4 mr-1" /> Back
          </Button>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${course.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
            {course.isPublished ? "Published" : "Draft"}
          </span>
        </div>

        <div className="flex gap-1 border-b border-border">
          {(["modules", "assignments", "info"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "modules" && <BookOpen className="size-4" />}
              {t === "assignments" && <ClipboardList className="size-4" />}
              {t === "info" && <FileText className="size-4" />}
              {t === "modules" ? "Chapters & Lessons" : t === "assignments" ? "Assignments" : "Course Info"}
            </button>
          ))}
        </div>

        {tab === "modules" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Chapters & Lessons</h3>
              <Button variant="navy" size="sm" onClick={() => setShowAddModule(!showAddModule)}>
                <Plus className="size-4 mr-1" /> Add Chapter
              </Button>
            </div>

            {showAddModule && (
              <form onSubmit={handleAddModule} className="card-surface space-y-4 p-6">
                <h4 className="font-bold">New Chapter</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Title *</Label>
                    <Input value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} required placeholder="e.g. Chapter 1: Introduction" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Summary</Label>
                    <Input value={newModuleSummary} onChange={(e) => setNewModuleSummary(e.target.value)} placeholder="Brief summary..." />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="navy">Create</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowAddModule(false)}>Cancel</Button>
                </div>
              </form>
            )}

            {course.modules.length === 0 ? (
              <div className="card-surface p-12 text-center">
                <p className="text-muted-foreground">No chapters yet. Click "Add Chapter" to start building your course.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {course.modules.map((mod) => (
                  <div key={mod._id} className="card-surface overflow-hidden">
                    <div className="flex items-center gap-3 bg-surface p-4">
                      <button onClick={() => toggleModule(mod._id)} className="text-muted-foreground hover:text-foreground">
                        {expandedModules[mod._id] ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                      </button>
                      <GripVertical className="size-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold">{mod.title}</h4>
                        {mod.summary && <p className="text-sm text-muted-foreground truncate">{mod.summary}</p>}
                      </div>
                      <span className="text-sm text-muted-foreground">{mod.lessons.length} lessons</span>
                      <Button variant="ghost" size="sm" onClick={() => setAddLessonModuleId(addLessonModuleId === mod._id ? null : mod._id)}>
                        <Plus className="size-3 mr-1" /> Lesson
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteModule(mod._id)}>
                        <Trash2 className="size-3 text-destructive" />
                      </Button>
                    </div>

                    {expandedModules[mod._id] && (
                      <div className="border-t border-border">
                        {mod.lessons.length === 0 ? (
                          <p className="px-12 py-6 text-center text-sm text-muted-foreground">No lessons yet</p>
                        ) : (
                          <div className="divide-y divide-border">
                            {mod.lessons.map((lesson) => (
                              <div key={lesson._id} className="flex items-center gap-3 px-10 py-3">
                                <GripVertical className="size-3 text-muted-foreground" />
                                <span className="text-sm font-medium">{lesson.title}</span>
                                <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground">{lesson.type}</span>
                                {lesson.duration && <span className="text-xs text-muted-foreground">{lesson.duration}</span>}
                                <div className="flex-1" />
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteLesson(mod._id, lesson._id)}>
                                  <Trash2 className="size-3 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {addLessonModuleId === mod._id && (
                          <form onSubmit={(e) => handleAddLesson(e, mod._id)} className="border-t border-border bg-surface/50 p-4 space-y-3">
                            <h5 className="text-sm font-semibold">Add Lesson</h5>
                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="grid gap-2">
                                <Label>Title *</Label>
                                <Input value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} required placeholder="Lesson title" />
                              </div>
                              <div className="grid gap-2">
                                <Label>Type</Label>
                                <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={newLessonType} onChange={(e) => setNewLessonType(e.target.value as "Video" | "PDF" | "DOCX" | "TXT")}>
                                  <option value="Video">Video</option>
                                  <option value="PDF">PDF</option>
                                  <option value="DOCX">DOCX</option>
                                  <option value="TXT">TXT</option>
                                </select>
                              </div>
                              <div className="grid gap-2">
                                <Label>Duration</Label>
                                <Input value={newLessonDuration} onChange={(e) => setNewLessonDuration(e.target.value)} placeholder="e.g. 10 min" />
                              </div>
                            </div>
                            {newLessonType === "Video" ? (
                              <div className="grid gap-2">
                                <Label>Video URL</Label>
                                <Input value={newLessonVideoUrl} onChange={(e) => setNewLessonVideoUrl(e.target.value)} placeholder="https://..." />
                              </div>
                            ) : (
                              <div className="grid gap-2">
                                <Label>File</Label>
                                {newLessonFileUrl ? (
                                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                                    <FileText className="size-5 text-primary shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-medium">{newLessonFileName || "Uploaded file"}</p>
                                      <p className="text-xs text-muted-foreground">{newLessonType}</p>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => { setNewLessonFileUrl(""); setNewLessonFileName(""); }}>
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <FileUploader
                                    folder="lessons"
                                    accept={
                                      newLessonType === "PDF" ? "application/pdf" :
                                      newLessonType === "DOCX" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
                                      "text/plain"
                                    }
                                    onUpload={(files) => {
                                      if (files[0]) {
                                        setNewLessonFileUrl(files[0].url);
                                        setNewLessonFileName(files[0].originalName);
                                      }
                                    }}
                                    label={`Upload ${newLessonType} file`}
                                    maxFileSize={100 * 1024 * 1024}
                                  />
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-3">
                              <Label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={newLessonPublished} onChange={(e) => setNewLessonPublished(e.target.checked)} className="rounded" />
                                Published (visible to students)
                              </Label>
                            </div>
                            <div className="flex gap-3">
                              <Button type="submit" variant="navy" size="sm">Add</Button>
                              <Button type="button" variant="ghost" size="sm" onClick={() => setAddLessonModuleId(null)}>Cancel</Button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2"><HelpCircle className="size-5" /> Quizzes</h3>
                <Button variant="navy" size="sm" onClick={() => setShowAddQuiz(!showAddQuiz)}>
                  <Plus className="size-4 mr-1" /> Add Quiz
                </Button>
              </div>

              {showAddQuiz && (
                <form onSubmit={handleAddQuiz} className="card-surface space-y-4 p-6">
                  <h4 className="font-bold">New Quiz</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Title *</Label>
                      <Input value={newQuizTitle} onChange={(e) => setNewQuizTitle(e.target.value)} required placeholder="e.g. Chapter 1 Quiz" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Duration (minutes)</Label>
                      <Input type="number" value={newQuizDuration} onChange={(e) => setNewQuizDuration(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" variant="navy">Create</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowAddQuiz(false)}>Cancel</Button>
                  </div>
                </form>
              )}

              {quizzes.length === 0 ? (
                <div className="card-surface p-8 text-center">
                  <p className="text-muted-foreground">No quizzes yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <div key={quiz._id} className="card-surface overflow-hidden">
                      <div className="flex items-center gap-3 bg-surface p-4">
                        <button onClick={() => handleToggleQuizExpand(quiz._id)} className="text-muted-foreground hover:text-foreground">
                          {expandedQuizId === quiz._id ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                        </button>
                        <HelpCircle className="size-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold">{quiz.title}</h4>
                          <p className="text-sm text-muted-foreground">{quiz.durationMinutes} min &middot; {quiz.questions?.length || 0} questions</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setAddQuestionQuizId(addQuestionQuizId === quiz._id ? null : quiz._id)}>
                          <Plus className="size-3 mr-1" /> Question
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteQuiz(quiz._id)}>
                          <Trash2 className="size-3 text-destructive" />
                        </Button>
                      </div>

                      {expandedQuizId === quiz._id && (
                        <div className="border-t border-border">
                          {(quizQuestions[quiz._id] || []).length === 0 ? (
                            <p className="px-12 py-6 text-center text-sm text-muted-foreground">No questions yet</p>
                          ) : (
                            <div className="divide-y divide-border">
                              {(quizQuestions[quiz._id] || []).map((q, idx) => (
                                <div key={q._id} className="flex items-start gap-3 px-10 py-3">
                                  <span className="text-sm font-medium text-muted-foreground">{idx + 1}.</span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">{q.question}</p>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                      {q.options.map((opt, oi) => (
                                        <span key={oi} className={`rounded-full px-2 py-0.5 text-xs ${oi === q.correctAnswer ? "bg-green-100 text-green-700 font-semibold" : "bg-surface text-muted-foreground"}`}>
                                          {opt}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{q.marks} marks</p>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(quiz._id, q._id)}>
                                    <Trash2 className="size-3 text-destructive" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {addQuestionQuizId === quiz._id && (
                            <form onSubmit={(e) => handleAddQuestion(e, quiz._id)} className="border-t border-border bg-surface/50 p-4 space-y-3">
                              <h5 className="text-sm font-semibold">Add Question</h5>
                              <div className="grid gap-2">
                                <Label>Question *</Label>
                                <Textarea value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)} rows={2} required placeholder="Enter question..." />
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {newQuestionOptions.map((opt, oi) => (
                                  <div key={oi} className="grid gap-1">
                                    <Label className="text-xs">Option {oi + 1} {oi === newQuestionAnswer && "(Correct)"}</Label>
                                    <div className="flex gap-2">
                                      <Input value={opt} onChange={(e) => {
                                        const updated = [...newQuestionOptions];
                                        updated[oi] = e.target.value;
                                        setNewQuestionOptions(updated);
                                      }} required placeholder={`Option ${oi + 1}`} />
                                      <Button type="button" variant={oi === newQuestionAnswer ? "navy" : "ghost"} size="sm" onClick={() => setNewQuestionAnswer(oi)}>
                                        {oi === newQuestionAnswer ? "✓" : "Set"}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="grid gap-2 sm:grid-cols-2">
                                <div className="grid gap-2">
                                  <Label>Marks</Label>
                                  <Input type="number" value={newQuestionMarks} onChange={(e) => setNewQuestionMarks(e.target.value)} />
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <Button type="submit" variant="navy" size="sm">Add</Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setAddQuestionQuizId(null)}>Cancel</Button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "assignments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Assignments</h3>
              <Button variant="navy" size="sm" onClick={() => setShowAddAssignment(!showAddAssignment)}>
                <Plus className="size-4 mr-1" /> Add Assignment
              </Button>
            </div>

            {showAddAssignment && (
              <form onSubmit={handleAddAssignment} className="card-surface space-y-4 p-6">
                <h4 className="font-bold">New Assignment</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Title *</Label>
                    <Input value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} required placeholder="Assignment title" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Total Marks</Label>
                    <Input type="number" value={newAssignment.totalMarks} onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Due Date</Label>
                    <Input type="date" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Instructions</Label>
                  <Textarea value={newAssignment.instructions} onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })} rows={3} placeholder="Assignment instructions..." />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="navy">Create</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowAddAssignment(false)}>Cancel</Button>
                </div>
              </form>
            )}

            {assignments.length === 0 ? (
              <div className="card-surface p-12 text-center">
                <p className="text-muted-foreground">No assignments yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((a) => (
                  <div key={a._id} className="card-surface flex items-center gap-4 p-4">
                    <ClipboardList className="size-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold">{a.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {a.totalMarks} marks
                        {a.dueDate && <> &middot; Due {new Date(a.dueDate).toLocaleDateString()}</>}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${a.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {a.isPublished ? "Published" : "Draft"}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAssignment(a._id)}>
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "info" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Course Info</h3>
              {!editCourseMode && (
                <Button variant="navy" size="sm" onClick={() => setEditCourseMode(true)}>
                  <Pencil className="size-4 mr-1" /> Edit
                </Button>
              )}
            </div>

            {editCourseMode ? (
              <form onSubmit={handleUpdateCourse} className="card-surface space-y-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Title *</Label>
                    <Input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Slug *</Label>
                    <Input value={courseForm.slug} onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Program</Label>
                    <Input value={courseForm.program} onChange={(e) => setCourseForm({ ...courseForm, program: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Input value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Instructor</Label>
                    <Input value={courseForm.instructor} onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Duration</Label>
                    <Input value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Level</Label>
                    <Input value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Fee (Rs.)</Label>
                    <Input type="number" value={courseForm.fee} onChange={(e) => setCourseForm({ ...courseForm, fee: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows={3} />
                </div>
                <div className="grid gap-2">
                  <Label>Thumbnail</Label>
                  {courseForm.imageUrl ? (
                    <FilePreview url={courseForm.imageUrl} name="Thumbnail" type="image/jpeg" onRemove={() => setCourseForm({ ...courseForm, imageUrl: "" })} />
                  ) : (
                    <FileUploader folder="courses" accept="image/*" onUpload={(files) => { if (files[0]) setCourseForm({ ...courseForm, imageUrl: files[0].url }); }} label="Upload thumbnail" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={courseForm.isPublished} onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.checked })} className="rounded" />
                    Published
                  </Label>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="navy">Save Changes</Button>
                  <Button type="button" variant="ghost" onClick={() => setEditCourseMode(false)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="card-surface space-y-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label className="text-muted-foreground">Title</Label><p className="font-semibold">{course.title}</p></div>
                  <div><Label className="text-muted-foreground">Slug</Label><p className="font-semibold">{course.slug}</p></div>
                  <div><Label className="text-muted-foreground">Program</Label><p>{course.program || "—"}</p></div>
                  <div><Label className="text-muted-foreground">Category</Label><p>{course.category || "—"}</p></div>
                  <div><Label className="text-muted-foreground">Instructor</Label><p>{course.instructor || "—"}</p></div>
                  <div><Label className="text-muted-foreground">Duration</Label><p>{course.duration || "—"}</p></div>
                  <div><Label className="text-muted-foreground">Level</Label><p>{course.level || "—"}</p></div>
                  <div><Label className="text-muted-foreground">Fee</Label><p>Rs. {course.fee || 0}</p></div>
                </div>
                <div><Label className="text-muted-foreground">Description</Label><p className="whitespace-pre-wrap">{course.description || "—"}</p></div>
                {course.imageUrl && (
                  <div><Label className="text-muted-foreground">Thumbnail</Label><img src={course.imageUrl} alt="" className="mt-1 h-32 rounded-lg object-cover" /></div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
