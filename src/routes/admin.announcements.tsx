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

export const Route = createFileRoute("/admin/announcements")({
  head: () => pageHead({ title: "Manage Announcements", description: "Post and manage announcements.", path: "/admin/announcements" }),
  component: () => (
    <AuthGuard requiredRole="admin">
      <AdminAnnouncementsPage />
    </AuthGuard>
  ),
});

interface AnnouncementData {
  _id: string;
  category: string;
  title: string;
  description: string;
  date: string;
}

function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "Announcement", title: "", description: "", date: "" });

  const load = () => {
    apiClient.get<AnnouncementData[]>(endpoints.announcements)
      .then(setAnnouncements)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiClient.post(endpoints.announcements, form);
    setShowForm(false);
    setForm({ category: "Announcement", title: "", description: "", date: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    await apiClient.delete(`/announcements/${id}`);
    load();
  };

  return (
    <AdminShell title="Announcements" description="Manage announcements and updates">
      <div className="space-y-6">
        <Button variant="navy" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4" /> New Announcement
        </Button>

        {showForm && (
          <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6">
            <h3 className="font-bold">New Announcement</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {["Announcement", "Event", "Academic Update", "Reminder"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid gap-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="grid gap-2"><Label>Date</Label><Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="e.g. 20 September 2026" /></div>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="flex gap-3">
              <Button type="submit" variant="navy">Post</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />)}</div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a._id} className="card-surface flex items-start justify-between gap-4 p-5">
                <div>
                  <span className="inline-block rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold">{a.category}</span>
                  <h3 className="mt-2 font-bold text-primary">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                  {a.date && <p className="mt-2 text-xs text-muted-foreground">{a.date}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(a._id)}>
                  <Trash2 className="size-3 text-destructive" />
                </Button>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-center text-muted-foreground py-8">No announcements yet</p>}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
