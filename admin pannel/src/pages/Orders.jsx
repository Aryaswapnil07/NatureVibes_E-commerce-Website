import { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";

const statusOptions = ["placed", "processing", "shipped", "delivered", "cancelled"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drafts, setDrafts] = useState({});
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const query = statusFilter === "all" ? "" : `?status=${statusFilter}`;
        const response = await fetch(`${API_BASE_URL}/api/orders/list${query}`, {
          headers: { token },
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Unable to fetch orders");
        }

        setOrders(payload.orders || []);
        setDrafts({});
      } catch (orderError) {
        setError(orderError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, token]);

  const handleStatusUpdate = async (order) => {
    const nextStatus = drafts[order._id] || order.status;
    if (nextStatus === order.status) {
      return;
    }

    setUpdatingId(order._id);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ orderId: order._id, status: nextStatus }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to update order");
      }

      setOrders((prev) =>
        prev.map((entry) =>
          entry._id === order._id ? { ...entry, status: nextStatus } : entry
        )
      );
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">
            Track and update incoming customer orders.
          </p>
        </div>

        <label className="text-sm text-gray-600">
          Status
          <select
            className="ml-2 rounded-md border border-gray-300 px-2 py-1 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500">Loading orders...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="px-3 py-3 font-medium">Order</th>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">Items</th>
                <th className="px-3 py-3 font-medium">Amount</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-100">
                  <td className="px-3 py-3 font-medium text-gray-800">{order.orderNumber}</td>
                  <td className="px-3 py-3 text-gray-700">
                    {order.customer?.name || order.address?.fullName || "Unknown"}
                  </td>
                  <td className="px-3 py-3 text-gray-700">{order.items?.length || 0}</td>
                  <td className="px-3 py-3 text-gray-700">{formatCurrency(order.amount)}</td>
                  <td className="px-3 py-3">
                    <select
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                      value={drafts[order._id] || order.status}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [order._id]: event.target.value,
                        }))
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(order)}
                      disabled={updatingId === order._id}
                      className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingId === order._id ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              ))}

              {!orders.length ? (
                <tr>
                  <td className="px-3 py-8 text-center text-sm text-gray-500" colSpan={7}>
                    No orders found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default Orders;
