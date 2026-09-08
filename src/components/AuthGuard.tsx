import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export function AuthGuard({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: "admin" | "student";
}) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      if (requiredRole === "admin") {
        navigate({ to: "/portal/login" });
      } else {
        navigate({ to: "/portal/login" });
      }
      return;
    }
    if (requiredRole === "admin" && !isAdmin) {
      navigate({ to: "/portal/dashboard" });
    }
    if (requiredRole === "student" && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole === "admin" && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
