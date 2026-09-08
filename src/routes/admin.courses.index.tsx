import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Settings, Image } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader, FilePreview } from "@/components/portal/FileUploader";
import { apiClient, endpoints } from "@/lib/api-client";

export const Route = createFileRoute("/admin/courses/")({
  component: AdminCoursesPage,
});

interface CourseData {
  _id: string;
  slug: string;
  title: string;
  program: string;
  category: string;
  instructor: string;
  duration: string;
  level: string;
  lessons: number;
  modules: Array<{ title: string; lessons: Array<unknown> }>;
  imageUrl: string;
  isPublished: boolean;
  fee: number;
  description: string;
}

const defaultForm = { title: "", slug: "", program: "", category: "", instructor: "", duration: "", level: "", description: "", imageUrl: "", fee: "0" };

function AdminCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const load = () => {
    setError(null);
    setLoading(true);
    apiClient.get<CourseData[]>("/courses/admin")
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setCourses(list);
      })
      .catch((err) => {
        console.error("Failed to load courses:", err);
        setError(err?.message || "Failed to load courses. Make sure the backend server is running.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, fee: parseInt(form.fee) || 0 };
      if (editingId) {
        await apiClient.put(`/courses/${editingId}`, payload);
      } else {
        await apiClient.post(endpoints.courses.list, payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(defaultForm);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    try {
      await apiClient.delete(`/courses/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const totalModules = (c: CourseData) => c.modules?.length || 0;
  const totalLessons = (c: CourseData) => c.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

  return (
    <AdminShell title="Courses" description="Manage academic courses and programs">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="navy" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(defaultForm); }}>
            <Plus className="size-4" /> Add Course
          </Button>
          <span className="text-sm text-muted-foreground">{courses.length} courses</span>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6">
            <h3 className="font-bold">{editingId ? "Edit Course" : "New Course"}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Mathematics Class XI" /></div>
              <div className="grid gap-2"><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="e.g. maths-xi" /></div>
              <div className="grid gap-2"><Label>Program *</Label><Input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} required placeholder="e.g. Class XI" /></div>
              <div className="grid gap-2"><Label>Category *</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required placeholder="e.g. Science" /></div>
              <div className="grid gap-2"><Label>Instructor *</Label><Input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} required placeholder="e.g. Mr. Ahmed" /></div>
              <div className="grid gap-2"><Label>Duration</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 6 months" /></div>
              <div className="grid gap-2"><Label>Level</Label><Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="e.g. Intermediate" /></div>
              <div className="grid gap-2"><Label>Fee (Rs.)</Label><Input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} /></div>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Brief description of the course..." /></div>
            <div className="grid gap-2">
              <Label>Thumbnail</Label>
              {form.imageUrl ? (
                <FilePreview url={form.imageUrl} name="Thumbnail" type="image/jpeg" onRemove={() => setForm({ ...form, imageUrl: "" })} />
              ) : (
                <FileUploader folder="courses" accept="image/*" onUpload={(files) => { if (files[0]) setForm({ ...form, imageUrl: files[0].url }); }} label="Upload thumbnail" />
              )}
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="navy">{editingId ? "Update" : "Create"}</Button>
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />)}
          </div>
        ) : error ? (
          <div className="card-surface p-12 text-center">
            <p className="text-destructive font-semibold mb-2">{error}</p>
            <Button variant="navy" size="sm" onClick={load}>Retry</Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <p className="text-muted-foreground">No courses yet. Click "Add Course" to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((c) => (
              <div key={c._id} className="card-surface flex items-center gap-4 p-4">
                <div className="shrink-0">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt="" className="size-12 rounded-lg object-cover" />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-lg bg-surface">
                      <Image className="size-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-semibold">{c.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {c.category} &middot; {c.instructor} &middot; {totalModules(c)} chapters, {totalLessons(c)} lessons
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {c.isPublished ? "Published" : "Draft"}
                  </span>
                  <Button variant="navy" size="sm" onClick={() => navigate({ to: "/admin/courses/$id", params: { id: c._id } })}>
                    <Settings className="size-3 mr-1" /> Manage
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditingId(c._id);
                    setForm({ title: c.title, slug: c.slug, program: c.program || "", category: c.category, instructor: c.instructor, duration: c.duration, level: c.level, description: c.description || "", imageUrl: c.imageUrl || "", fee: String(c.fee || 0) });
                    setShowForm(true);
                  }}>
                    <Pencil className="size-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c._id)}>
                    <Trash2 className="size-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
