import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoIcon } from "@/components/site/Logo";
import { pageHead } from "@/lib/seo";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin/login")({
  head: () =>
    pageHead({
      title: "Admin Login",
      description: "Admin login for The Ali's Collegiate management panel.",
      path: "/admin/login",
    }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        setError("This is the admin login. Please use the student portal.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="bg-surface py-16 sm:py-20">
        <div className="container-page mx-auto max-w-md">
          <div className="card-surface p-7 sm:p-8">
            <div className="flex flex-col items-center">
              <LogoIcon size={64} />
              <h1 className="mt-4 text-center text-2xl font-bold">Admin Login</h1>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                The Ali&apos;s Collegiate Management Panel
              </p>
            </div>
            {error ? (
              <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@thealiscollegiate.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="navy" size="xl" className="mt-2 w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In to Admin Panel"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/portal/login" className="font-semibold text-navy-2 hover:text-primary">
                Student Login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
