import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/site/Logo";
import { pageHead } from "@/lib/seo";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/portal/login")({
  head: () =>
    pageHead({
      title: "Student Login",
      description: "Sign in to the student portal of The Ali's Collegiate to access your courses and materials.",
      path: "/portal/login",
    }),
  component: LoginPage,
});

function LoginPage() {
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
      // Redirect based on user role
      if (user.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/portal/dashboard" });
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
            <Logo className="justify-center" />
            <h1 className="mt-7 text-center text-2xl">Student Login</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Credentials are issued after your admission is confirmed.
            </p>
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
                  placeholder="you@example.com"
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
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox id="remember" /> Remember me
                </label>
                <Link to="/contact" className="text-sm font-semibold text-navy-2 hover:text-primary">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" variant="navy" size="xl" className="mt-2 w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              New student?{" "}
              <Link to="/portal/register" className="font-semibold text-navy-2 hover:text-primary">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
