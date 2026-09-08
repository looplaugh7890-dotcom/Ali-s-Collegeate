import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { pageHead } from "@/lib/seo";
import { apiClient, endpoints } from "@/lib/api-client";

export const Route = createFileRoute("/admin/assignments")({
  head: () => pageHead({ title: "Manage Assignments", description: "Create and manage course assignments.", path: "/admin/assignments" }),
  component: () => (
    <AuthGuard requiredRole="admin">
      <AdminAssignmentsPage />
    </AuthGuard>
  ),
});

interface AssignmentData {
  _id: string;
  title: string;
  course?: { title: string; slug: string };
  dueDate: string;
  totalMarks: number;
  isPublished: boolean;
}

interface CourseOption { _id: string; title: string; }

function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", course: "", instructions: "", dueDate: "", totalMarks: "20" });

  const load = () => {
    Promise.all([
      apiClient.get<AssignmentData[]>(endpoints.admin.assignments),
      apiClient.get<CourseOption[]>(endpoints.courses.list),
    ]).then(([a, c]) => { setAssignments(a); setCourses(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(endpoints.admin.assignments, {
        ...form,
        totalMarks: parseInt(form.totalMarks),
      });
      setShowForm(false);
      setForm({ title: "", course: "", instructions: "", dueDate: "", totalMarks: "20" });
      load();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this assignment?")) return;
    await apiClient.delete(`/admin/assignments/${id}`);
    load();
  };

  return (
    <AdminShell title="Assignments" description="Manage course assignments">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="navy" onClick={() => setShowForm(!showForm)}>
            <Plus className="size-4" /> Add Assignment
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6">
            <h3 className="font-bold">New Assignment</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="grid gap-2">
                <Label>Course</Label>
                <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required>
                  <option value="">Select course</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div className="grid gap-2"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Total Marks</Label><Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} /></div>
            </div>
            <div className="grid gap-2"><Label>Instructions</Label><Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={3} /></div>
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
                  <th className="px-4 py-3 text-left font-semibold">Due Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Marks</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a._id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-semibold">{a.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.course?.title || "—"}</td>
                    <td className="px-4 py-3">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">{a.totalMarks}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(a._id)}>
                        <Trash2 className="size-3 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No assignments yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
