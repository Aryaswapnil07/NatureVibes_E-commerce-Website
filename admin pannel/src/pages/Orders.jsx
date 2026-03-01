import { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";

const statusOptions = ["placed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatusOptions = ["pending", "paid", "failed", "refunded"];

const statusBadgeClasses = {
  placed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const paymentBadgeClasses = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-slate-100 text-slate-700 border-slate-200",
};

const paymentMethodLabels = {
  cod: "Cash on Delivery",
  razorpay: "Razorpay",
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(parsedDate);
};

const formatDisplayLabel = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getLocationLabel = (order) => {
  const { address = {} } = order;
  const region = [address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
  return region || "Not provided";
};

const getStreetAddress = (order) => {
  const streetAddress = order.address?.streetAddress;
  return streetAddress || "Street address not provided";
};

const getDraftValue = (drafts, order, key, fallbackValue) =>
  drafts[order._id]?.[key] || order[key] || fallbackValue;

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

  const handleDraftChange = (orderId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value,
      },
    }));
  };

  const handleOrderUpdate = async (order) => {
    const nextStatus = getDraftValue(drafts, order, "status", "placed");
    const nextPaymentStatus = getDraftValue(
      drafts,
      order,
      "paymentStatus",
      "pending"
    );

    const isOrderStatusChanged = nextStatus !== order.status;
    const isPaymentStatusChanged =
      nextPaymentStatus !== (order.paymentStatus || "pending");

    if (!isOrderStatusChanged && !isPaymentStatusChanged) {
      return;
    }

    setUpdatingId(order._id);
    setError("");

    try {
      const requestBody = { orderId: order._id };

      if (isOrderStatusChanged) {
        requestBody.status = nextStatus;
      }

      if (isPaymentStatusChanged) {
        requestBody.paymentStatus = nextPaymentStatus;
      }

      const response = await fetch(`${API_BASE_URL}/api/orders/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify(requestBody),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to update order");
      }

      setOrders((prev) =>
        prev.map((entry) =>
          entry._id === order._id
            ? {
                ...entry,
                status: payload.order?.status || nextStatus,
                paymentStatus: payload.order?.paymentStatus || nextPaymentStatus,
              }
            : entry
        )
      );
      setDrafts((prev) => {
        const nextDrafts = { ...prev };
        delete nextDrafts[order._id];
        return nextDrafts;
      });
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
                <th className="px-3 py-3 font-medium">Location</th>
                <th className="px-3 py-3 font-medium">Items</th>
                <th className="px-3 py-3 font-medium">Amount</th>
                <th className="px-3 py-3 font-medium">Payment</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const selectedStatus = getDraftValue(drafts, order, "status", "placed");
                const selectedPaymentStatus = getDraftValue(
                  drafts,
                  order,
                  "paymentStatus",
                  "pending"
                );
                const isChanged =
                  selectedStatus !== order.status ||
                  selectedPaymentStatus !== (order.paymentStatus || "pending");

                return (
                  <tr key={order._id} className="border-b border-gray-100 align-top">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-gray-900">{order.orderNumber || "-"}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Placed on {formatDateTime(order.createdAt)}
                      </p>
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      <p className="font-medium text-gray-900">
                        {order.customer?.name || order.address?.fullName || "Unknown customer"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.customer?.phone || order.address?.phone || "Phone unavailable"}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {order.customer?.email || "Email unavailable"}
                      </p>
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      <p className="font-medium text-gray-900">{getLocationLabel(order)}</p>
                      <p className="mt-1 max-w-xs text-xs text-gray-500">{getStreetAddress(order)}</p>
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      <p className="font-medium text-gray-900">{order.items?.length || 0} items</p>
                      <p className="mt-1 max-w-xs text-xs text-gray-500">
                        {(order.items || [])
                          .slice(0, 2)
                          .map((item) => `${item.name} x${item.quantity}`)
                          .join(", ") || "No items"}
                      </p>
                    </td>

                    <td className="px-3 py-3 font-semibold text-gray-900">
                      {formatCurrency(order.amount)}
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      <p className="text-xs text-gray-500">Method</p>
                      <p className="font-medium text-gray-900">
                        {paymentMethodLabels[order.paymentMethod] ||
                          formatDisplayLabel(order.paymentMethod) ||
                          "Not set"}
                      </p>

                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500">Payment status</p>
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                            paymentBadgeClasses[selectedPaymentStatus] ||
                            "border-gray-200 bg-gray-100 text-gray-700"
                          }`}
                        >
                          {formatDisplayLabel(selectedPaymentStatus)}
                        </span>
                        <select
                          className="mt-1 block rounded-md border border-gray-300 px-2 py-1 text-sm"
                          value={selectedPaymentStatus}
                          onChange={(event) =>
                            handleDraftChange(
                              order._id,
                              "paymentStatus",
                              event.target.value
                            )
                          }
                        >
                          {paymentStatusOptions.map((paymentStatus) => (
                            <option key={paymentStatus} value={paymentStatus}>
                              {formatDisplayLabel(paymentStatus)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`mb-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                          statusBadgeClasses[selectedStatus] ||
                          "border-gray-200 bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formatDisplayLabel(selectedStatus)}
                      </span>
                      <select
                        className="block rounded-md border border-gray-300 px-2 py-1 text-sm"
                        value={selectedStatus}
                        onChange={(event) =>
                          handleDraftChange(order._id, "status", event.target.value)
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {formatDisplayLabel(status)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => handleOrderUpdate(order)}
                        disabled={updatingId === order._id || !isChanged}
                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingId === order._id ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!orders.length ? (
                <tr>
                  <td className="px-3 py-8 text-center text-sm text-gray-500" colSpan={8}>
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
