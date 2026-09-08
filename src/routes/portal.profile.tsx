import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pageHead } from "@/lib/seo";
import { api, apiClient, endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/portal/profile")({
  head: () =>
    pageHead({
      title: "Profile",
      description: "Your student profile and account details.",
      path: "/portal/profile",
    }),
  component: () => (
    <AuthGuard requiredRole="student">
      <ProfilePage />
    </AuthGuard>
  ),
});

interface StudentProfile {
  _id: string;
  user?: { name: string; email: string; phone?: string };
  rollNumber: string;
  className: string;
  stream?: string;
  guardianName?: string;
  admissionDate?: string;
}

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getStudent()
      .then((data) => setProfile(data as unknown as StudentProfile))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await apiClient.put(endpoints.student.profile, {
        guardianName: profile.guardianName,
      });
    } catch { /* silent */ }
    setSaving(false);
  };

  const name = profile?.user?.name || user?.name || "";
  const email = profile?.user?.email || user?.email || "";
  const phone = profile?.user?.phone || "";

  return (
    <PortalShell title="Profile" description="Your account and enrolment details.">
      <div className="space-y-6">
        {loading ? (
          <div className="card-surface p-6 text-center text-sm text-muted-foreground">Loading profile...</div>
        ) : !profile ? (
          <div className="card-surface p-6 text-center text-sm text-muted-foreground">No profile found. Contact admin.</div>
        ) : (
          <>
            <section className="card-surface flex flex-wrap items-center gap-4 p-6">
              <span
                aria-hidden
                className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
              >
                {name.charAt(0) || "S"}
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-primary">{name}</h2>
                <p className="text-sm text-muted-foreground">
                  {profile.className}{profile.stream ? ` · ${profile.stream}` : ""} · Roll {profile.rollNumber}
                </p>
              </div>
            </section>

            <form className="card-surface grid gap-4 p-6 sm:grid-cols-2" onSubmit={handleSubmit}>
              <h2 className="text-base font-bold sm:col-span-2">Account Details</h2>
              <div className="grid gap-2">
                <Label>Full name</Label>
                <Input value={name} readOnly />
              </div>
              <div className="grid gap-2">
                <Label>Email address</Label>
                <Input value={email} readOnly />
              </div>
              <div className="grid gap-2">
                <Label>Phone number</Label>
                <Input value={phone} readOnly />
              </div>
              <div className="grid gap-2">
                <Label>Guardian name</Label>
                <Input
                  value={profile.guardianName || ""}
                  onChange={(e) => setProfile({ ...profile, guardianName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Roll number</Label>
                <Input value={profile.rollNumber} readOnly />
              </div>
              <div className="grid gap-2">
                <Label>Admission date</Label>
                <Input value={profile.admissionDate ? new Date(profile.admissionDate).toLocaleDateString() : "—"} readOnly />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="navy" className="w-full sm:w-auto" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </PortalShell>
  );
}
