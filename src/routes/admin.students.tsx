import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Input } from "@/components/ui/input";
import { pageHead } from "@/lib/seo";
import { apiClient, endpoints } from "@/lib/api-client";

export const Route = createFileRoute("/admin/students")({
  head: () => pageHead({ title: "Manage Students", description: "View and manage student records.", path: "/admin/students" }),
  component: () => (
    <AuthGuard requiredRole="admin">
      <AdminStudentsPage />
    </AuthGuard>
  ),
});

interface StudentData {
  _id: string;
  rollNumber: string;
  className: string;
  stream: string;
  user?: { name: string; email: string; phone?: string };
  admissionDate: string;
  paymentStatus: string;
}

function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiClient.get<StudentData[]>(endpoints.admin.students)
      .then(setStudents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) =>
    s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Students" description="View and manage enrolled students">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          <span className="text-sm text-muted-foreground">{filtered.length} students</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />)}
          </div>
        ) : (
          <div className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left font-semibold">Roll No</th>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Class</th>
                    <th className="px-4 py-3 text-left font-semibold">Stream</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s._id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{s.rollNumber}</td>
                      <td className="px-4 py-3 font-semibold">{s.user?.name || "—"}</td>
                      <td className="px-4 py-3">{s.className}</td>
                      <td className="px-4 py-3">{s.stream}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.user?.email || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          s.paymentStatus === "paid" ? "bg-green-100 text-green-700" :
                          s.paymentStatus === "partial" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {s.paymentStatus || "unpaid"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No students found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
