import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, FileText } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader, FilePreview } from "@/components/portal/FileUploader";
import { pageHead } from "@/lib/seo";
import { apiClient, endpoints } from "@/lib/api-client";

export const Route = createFileRoute("/admin/resources")({
  head: () => pageHead({ title: "Manage Resources", description: "Add and manage study resources.", path: "/admin/resources" }),
  component: () => (
    <AuthGuard requiredRole="admin">
      <AdminResourcesPage />
    </AuthGuard>
  ),
});

interface ResourceData {
  _id: string;
  slug: string;
  title: string;
  type: string;
  category: string;
  access: string;
  fileUrl: string;
  meta: string;
  isPublished: boolean;
}

const defaultForm = { title: "", slug: "", type: "PDF", category: "", access: "free", description: "", fileUrl: "", meta: "" };

function AdminResourcesPage() {
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const load = () => {
    apiClient.get<ResourceData[]>(endpoints.resources.list)
      .then((res) => setResources(Array.isArray(res) ? res : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(endpoints.resources.list, form);
      setShowForm(false);
      setForm(defaultForm);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    try {
      await apiClient.delete(`/resources/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminShell title="Resources" description="Manage study materials and resources">
      <div className="space-y-6">
        <Button variant="navy" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4" /> Add Resource
        </Button>

        {showForm && (
          <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6">
            <h3 className="font-bold">New Resource</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="grid gap-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {["PDF", "Video", "Document", "Past Paper", "Study Material", "Scholarship", "Exam Schedule"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Access</Label>
                <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.access} onChange={(e) => setForm({ ...form, access: e.target.value })}>
                  <option value="free">Free</option>
                  <option value="login">Login Required</option>
                  <option value="enrolled">Enrolled Only</option>
                </select>
              </div>
              <div className="grid gap-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Science, Notes" /></div>
              <div className="grid gap-2"><Label>Meta</Label><Input value={form.meta} onChange={(e) => setForm({ ...form, meta: e.target.value })} placeholder="e.g. 24 pages, 15 min" /></div>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="grid gap-2">
              <Label>File</Label>
              {form.fileUrl ? (
                <FilePreview url={form.fileUrl} name={form.title || "Resource file"} type="application/pdf" onRemove={() => setForm({ ...form, fileUrl: "" })} />
              ) : (
                <FileUploader
                  folder="resources"
                  accept="application/pdf,video/mp4,video/webm,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onUpload={(files) => { if (files[0]) setForm({ ...form, fileUrl: files[0].url }); }}
                  label="Upload file"
                />
              )}
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left font-semibold">Title</th>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                    <th className="px-4 py-3 text-left font-semibold">Access</th>
                    <th className="px-4 py-3 text-left font-semibold">File</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => (
                    <tr key={r._id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-semibold">{r.title}</td>
                      <td className="px-4 py-3">{r.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.category || "-"}</td>
                      <td className="px-4 py-3 capitalize">{r.access}</td>
                      <td className="px-4 py-3">
                        {r.fileUrl ? (
                          <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <FileText className="size-3" /> View
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">No file</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(r._id)}>
                          <Trash2 className="size-3 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
