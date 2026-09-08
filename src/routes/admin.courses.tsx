import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin/courses")({
  head: () => pageHead({ title: "Manage Courses", description: "Add, edit and manage courses.", path: "/admin/courses" }),
  component: () => (
    <AuthGuard requiredRole="admin">
      <Outlet />
    </AuthGuard>
  ),
});
