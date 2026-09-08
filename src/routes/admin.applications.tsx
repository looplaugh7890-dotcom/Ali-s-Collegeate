import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pageHead } from "@/lib/seo";
import { apiClient, endpoints } from "@/lib/api-client";
import { Eye, CheckCircle, XCircle, Clock, FileText, Loader2, X } from "lucide-react";

export const Route = createFileRoute("/admin/applications")({
  head: () => pageHead({ title: "Manage Applications", description: "Review and manage admission applications.", path: "/admin/applications" }),
  component: () => (
    <AuthGuard requiredRole="admin">
      <AdminApplicationsPage />
    </AuthGuard>
  ),
});

interface ApplicationData {
  _id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  program: string;
  stream: string;
  batch: string;
  lastClassPassed: string;
  board: string;
  marksObtained: string;
  passingYear: string;
  previousSchool: string;
  fatherName: string;
  cnicBform: string;
  guardianPhone: string;
  address: string;
  city: string;
  paymentMethod: string;
  status: string;
  adminNotes: string;
  documents: { url: string; name: string; uploadedAt: string }[];
  createdAt: string;
}

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  "under-review": "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  draft: "bg-gray-100 text-gray-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  submitted: <FileText className="size-4" />,
  "under-review": <Clock className="size-4" />,
  accepted: <CheckCircle className="size-4" />,
  rejected: <XCircle className="size-4" />,
};

function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<ApplicationData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    apiClient.get<ApplicationData[]>(`${endpoints.applications.list}?${params}`)
      .then((res) => setApplications(Array.isArray(res) ? res : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const app = await apiClient.get<ApplicationData>(`${endpoints.applications.list}/${id}`);
      setSelected(app);
      setNotes(app.adminNotes || "");
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const updated = await apiClient.put<ApplicationData>(endpoints.applications.updateStatus(selected._id), { status, notes });
      setSelected(updated);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminShell title="Applications" description="Review and manage admission applications">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Input placeholder="Search applications..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under-review">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <span className="text-sm text-muted-foreground">{applications.length} applications</span>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />)}</div>
        ) : (
          <div className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left font-semibold">App #</th>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Program</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a) => (
                    <tr key={a._id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{a.applicationNumber}</td>
                      <td className="px-4 py-3 font-semibold">{a.firstName} {a.lastName}</td>
                      <td className="px-4 py-3">{a.program} — {a.stream}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[a.status] || "bg-gray-100 text-gray-700"}`}>
                          {statusIcons[a.status]}
                          {a.status?.replace("-", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(a._id)} disabled={detailLoading}>
                            <Eye className="size-4" /> View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No applications found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-10 pb-10">
          <div className="relative w-full max-w-3xl rounded-xl border border-border bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">{selected.firstName} {selected.lastName}</h2>
                <p className="text-sm text-muted-foreground">{selected.applicationNumber}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-md p-1 hover:bg-surface"><X className="size-5" /></button>
            </div>

            {/* Body */}
            <div className="space-y-6 px-6 py-5">
              {/* Status + Actions */}
              <div className="flex items-center justify-between rounded-lg bg-surface p-4">
                <div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${statusColors[selected.status]}`}>
                    {statusIcons[selected.status]}
                    {selected.status?.replace("-", " ")}
                  </span>
                  {selected.adminNotes && <p className="mt-2 text-sm text-muted-foreground">{selected.adminNotes}</p>}
                </div>
                <div className="flex gap-2">
                  {selected.status !== "accepted" && selected.status !== "rejected" && (
                    <>
                      <Button variant="navy" size="sm" disabled={actionLoading} onClick={() => updateStatus("accepted")}>
                        {actionLoading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />} Accept
                      </Button>
                      <Button variant="destructive" size="sm" disabled={actionLoading} onClick={() => updateStatus("rejected")}>
                        {actionLoading ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />} Reject
                      </Button>
                    </>
                  )}
                  {selected.status === "submitted" && (
                    <Button variant="outlineNavy" size="sm" disabled={actionLoading} onClick={() => updateStatus("under-review")}>
                      <Clock className="size-4" /> Mark Under Review
                    </Button>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="mb-1 block text-sm font-semibold">Admin Notes</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Add notes about this application..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button variant="ghost" size="sm" className="mt-1" disabled={actionLoading || notes === selected.adminNotes}
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      const updated = await apiClient.put<ApplicationData>(endpoints.applications.updateStatus(selected._id), { status: selected.status, notes });
                      setSelected(updated);
                    } finally {
                      setActionLoading(false);
                    }
                  }}>Save Notes</Button>
              </div>

              {/* Personal Info */}
              <Section title="Personal Information">
                <Field label="Full Name" value={`${selected.firstName} ${selected.lastName}`} />
                <Field label="Gender" value={selected.gender} />
                <Field label="Email" value={selected.email} />
                <Field label="Phone" value={selected.phone} />
                <Field label="City" value={selected.city} />
                <Field label="Address" value={selected.address} />
              </Section>

              {/* Academic Info */}
              <Section title="Academic Information">
                <Field label="Program" value={selected.program} />
                <Field label="Stream" value={selected.stream} />
                <Field label="Batch" value={selected.batch} />
                <Field label="Last Class Passed" value={selected.lastClassPassed} />
                <Field label="Board" value={selected.board} />
                <Field label="Marks Obtained" value={selected.marksObtained} />
                <Field label="Passing Year" value={selected.passingYear} />
                <Field label="Previous School" value={selected.previousSchool} />
              </Section>

              {/* Guardian Info */}
              <Section title="Guardian / Father Information">
                <Field label="Father Name" value={selected.fatherName} />
                <Field label="CNIC / B-Form" value={selected.cnicBform} />
                <Field label="Guardian Phone" value={selected.guardianPhone} />
              </Section>

              {/* Documents */}
              {selected.documents && selected.documents.length > 0 && (
                <Section title="Uploaded Documents">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selected.documents.map((doc, i) => (
                      <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 hover:bg-primary/5">
                        <FileText className="size-8 text-primary" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">Uploaded {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "—"}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </Section>
              )}

              {/* Payment */}
              <Section title="Payment">
                <Field label="Payment Method" value={selected.paymentMethod} />
                <Field label="Submitted" value={selected.createdAt ? new Date(selected.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }) : "—"} />
              </Section>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
