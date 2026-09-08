import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CreditCard, GraduationCap, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuthGuard } from "@/components/AuthGuard";
import { StatCard } from "@/components/portal/StatCard";
import { pageHead } from "@/lib/seo";
import { apiClient, endpoints } from "@/lib/api-client";

export const Route = createFileRoute("/admin/")({
  head: () => pageHead({ title: "Admin Dashboard", description: "Admin dashboard for The Ali's Collegiate.", path: "/admin" }),
  component: () => (
    <AuthGuard requiredRole="admin">
      <AdminDashboardPage />
    </AuthGuard>
  ),
});

interface DashboardData {
  totalStudents: number;
  totalCourses: number;
  totalApplications: number;
  totalRevenue: number;
  unreadContacts: number;
  applicationsByStatus: Array<{ _id: string; count: number }>;
}

function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<DashboardData>(endpoints.admin.dashboard)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell title="Admin Dashboard" description="Overview of institute operations">
      <div className="space-y-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-surface h-28 animate-pulse bg-surface" />
            ))}
          </div>
        ) : data ? (
          <>
            <section>
              <h2 className="text-lg">Overview</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={Users} label="Total Students" value={String(data.totalStudents)} />
                <StatCard icon={BookOpen} label="Total Courses" value={String(data.totalCourses)} />
                <StatCard icon={GraduationCap} label="Applications" value={String(data.totalApplications)} />
                <StatCard icon={CreditCard} label="Revenue" value={`Rs. ${data.totalRevenue.toLocaleString()}`} />
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="card-surface p-6">
                <h2 className="text-base font-bold">Applications by Status</h2>
                <ul className="mt-4 space-y-3">
                  {data.applicationsByStatus.map((s) => (
                    <li key={s._id} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{s._id?.replace("-", " ") || "Unknown"}</span>
                      <span className="font-bold text-primary">{s.count}</span>
                    </li>
                  ))}
                  {data.applicationsByStatus.length === 0 && (
                    <li className="text-sm text-muted-foreground">No applications yet</li>
                  )}
                </ul>
              </section>

              <section className="card-surface p-6">
                <h2 className="text-base font-bold">Quick Actions</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <a href="/admin/courses" className="rounded-lg border border-border bg-surface p-4 text-center text-sm font-semibold text-primary hover:border-gold">Manage Courses</a>
                  <a href="/admin/applications" className="rounded-lg border border-border bg-surface p-4 text-center text-sm font-semibold text-primary hover:border-gold">Review Applications</a>
                  <a href="/admin/students" className="rounded-lg border border-border bg-surface p-4 text-center text-sm font-semibold text-primary hover:border-gold">View Students</a>
                  <a href="/admin/announcements" className="rounded-lg border border-border bg-surface p-4 text-center text-sm font-semibold text-primary hover:border-gold">Post Announcement</a>
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
