import { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const statCards = (summary) => [
  { label: "Total Orders", value: summary.totalOrders || 0 },
  { label: "Processing", value: summary.processingOrders || 0 },
  { label: "Delivered", value: summary.deliveredOrders || 0 },
  { label: "Cancelled", value: summary.cancelledOrders || 0 },
  { label: "Products", value: summary.totalProducts || 0 },
  { label: "Users", value: summary.totalUsers || 0 },
];

const Dashboard = ({ token }) => {
  const [data, setData] = useState({
    summary: {},
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/summary`, {
          headers: { token },
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Unable to load dashboard");
        }

        setData({
          summary: payload.summary || {},
          recentOrders: payload.recentOrders || [],
        });
      } catch (summaryError) {
        setError(summaryError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading dashboard...</p>;
  }

  if (error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Monitor your orders, revenue, products, and users from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards(data.summary).map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">Revenue (non-cancelled orders)</p>
        <p className="mt-2 text-3xl font-bold text-green-700">
          {formatCurrency(data.summary.totalRevenue)}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>

        {data.recentOrders.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="px-2 py-2 font-medium">Order</th>
                  <th className="px-2 py-2 font-medium">Customer</th>
                  <th className="px-2 py-2 font-medium">Amount</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100">
                    <td className="px-2 py-2 font-medium text-gray-800">{order.orderNumber}</td>
                    <td className="px-2 py-2 text-gray-700">
                      {order.customer?.name || "Unknown"}
                    </td>
                    <td className="px-2 py-2 text-gray-700">{formatCurrency(order.amount)}</td>
                    <td className="px-2 py-2">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500">No orders yet.</p>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
