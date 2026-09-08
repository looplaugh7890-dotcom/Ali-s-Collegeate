import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pageHead } from "@/lib/seo";
import { apiClient, endpoints } from "@/lib/api-client";

export const Route = createFileRoute("/admin/quizzes")({
  head: () => pageHead({ title: "Manage Quizzes", description: "Create and manage course quizzes.", path: "/admin/quizzes" }),
  component: () => (
    <AuthGuard requiredRole="admin">
      <AdminQuizzesPage />
    </AuthGuard>
  ),
});

interface QuizData {
  _id: string;
  title: string;
  course?: { title: string };
  durationMinutes: number;
  questions: Array<{ question: string; options: string[]; correctAnswer: number }>;
  isPublished: boolean;
}

interface CourseOption { _id: string; title: string; }

function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", course: "", durationMinutes: "20" });

  const load = () => {
    Promise.all([
      apiClient.get<QuizData[]>(endpoints.admin.quizzes),
      apiClient.get<CourseOption[]>(endpoints.courses.list),
    ]).then(([q, c]) => { setQuizzes(q); setCourses(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(endpoints.admin.quizzes, { ...form, durationMinutes: parseInt(form.durationMinutes), questions: [] });
      setShowForm(false);
      setForm({ title: "", course: "", durationMinutes: "20" });
      load();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quiz?")) return;
    await apiClient.delete(`/admin/quizzes/${id}`);
    load();
  };

  return (
    <AdminShell title="Quizzes" description="Manage course quizzes">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="navy" onClick={() => setShowForm(!showForm)}>
            <Plus className="size-4" /> Add Quiz
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6">
            <h3 className="font-bold">New Quiz</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="grid gap-2">
                <Label>Course</Label>
                <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required>
                  <option value="">Select course</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div className="grid gap-2"><Label>Duration (min)</Label><Input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} /></div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="navy">Create</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />)}</div>
        ) : (
          <div className="card-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Course</th>
                  <th className="px-4 py-3 text-left font-semibold">Duration</th>
                  <th className="px-4 py-3 text-left font-semibold">Questions</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q._id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-semibold">{q.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{q.course?.title || "—"}</td>
                    <td className="px-4 py-3">{q.durationMinutes} min</td>
                    <td className="px-4 py-3">{q.questions?.length || 0}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(q._id)}>
                        <Trash2 className="size-3 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {quizzes.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No quizzes yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
