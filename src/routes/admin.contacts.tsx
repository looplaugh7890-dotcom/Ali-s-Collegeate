import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Mail } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { apiClient, endpoints } from "@/lib/api-client";

export const Route = createFileRoute("/admin/contacts")({
  head: () => pageHead({ title: "Messages", description: "View contact form submissions.", path: "/admin/contacts" }),
  component: () => (
    <AuthGuard requiredRole="admin">
      <AdminContactsPage />
    </AuthGuard>
  ),
});

interface ContactData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    apiClient.get<ContactData[]>(endpoints.admin.contacts)
      .then(setContacts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await apiClient.put(endpoints.admin.markRead(id));
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await apiClient.delete(`/admin/contacts/${id}`);
    load();
  };

  return (
    <AdminShell title="Messages" description="Contact form submissions and enquiries">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{contacts.filter((c) => !c.isRead).length} unread</span>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />)}</div>
        ) : (
          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c._id} className={`card-surface p-5 ${!c.isRead ? "border-l-4 border-l-gold" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-primary">{c.name}</h3>
                      <span className="text-xs text-muted-foreground">{c.email}</span>
                      {c.phone && <span className="text-xs text-muted-foreground">{c.phone}</span>}
                    </div>
                    {c.subject && <p className="mt-1 text-sm font-semibold">{c.subject}</p>}
                    <p className="mt-2 text-sm text-muted-foreground">{c.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!c.isRead && (
                      <Button variant="ghost" size="sm" onClick={() => markRead(c._id)}>
                        <Mail className="size-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c._id)}>
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {contacts.length === 0 && <p className="text-center text-muted-foreground py-8">No messages yet</p>}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
