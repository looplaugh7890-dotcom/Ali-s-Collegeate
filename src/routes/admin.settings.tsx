import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuthGuard } from "@/components/AuthGuard";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin/settings")({
  head: () => pageHead({ title: "Settings", description: "Website and system settings.", path: "/admin/settings" }),
  component: () => (
    <AuthGuard requiredRole="admin">
      <AdminSettingsPage />
    </AuthGuard>
  ),
});

function AdminSettingsPage() {
  return (
    <AdminShell title="Settings" description="Website and system configuration">
      <div className="space-y-6">
        <div className="card-surface p-6">
          <h2 className="text-base font-bold">Site Information</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Site settings can be managed through the database or environment variables.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs text-muted-foreground">Institute Name</p>
              <p className="font-semibold">The Ali's Collegiate</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs text-muted-foreground">Tagline</p>
              <p className="font-semibold">Passion for Victory</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs text-muted-foreground">Admission Fee</p>
              <p className="font-semibold">Rs. 2,000</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs text-muted-foreground">Monthly Fee</p>
              <p className="font-semibold">Rs. 4,500</p>
            </div>
          </div>
        </div>

        <div className="card-surface p-6">
          <h2 className="text-base font-bold">Admin Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Admin credentials can be changed from the profile page or through the database.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Default admin: admin@thealiscollegiate.com / admin123
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
