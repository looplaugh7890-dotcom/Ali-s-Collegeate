import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuthGuard } from "@/components/AuthGuard";
import { pageHead } from "@/lib/seo";
import { apiClient, endpoints } from "@/lib/api-client";

export const Route = createFileRoute("/admin/payments")({
  head: () => pageHead({ title: "Manage Payments", description: "View payment history and transactions.", path: "/admin/payments" }),
  component: () => (
    <AuthGuard requiredRole="admin">
      <AdminPaymentsPage />
    </AuthGuard>
  ),
});

interface PaymentData {
  _id: string;
  reference: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  description: string;
  paidAt: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
};

function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<PaymentData[]>(endpoints.admin.payments)
      .then(setPayments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell title="Payments" description="View all payment transactions">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{payments.length} transactions</span>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />)}</div>
        ) : (
          <div className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left font-semibold">Reference</th>
                    <th className="px-4 py-3 text-left font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold">Method</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
                      <td className="px-4 py-3 font-semibold">Rs. {p.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3 capitalize">{p.method}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[p.status] || "bg-gray-100 text-gray-700"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No payments yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
