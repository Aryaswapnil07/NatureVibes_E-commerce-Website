import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import MaterialSpinner from "../components/MaterialSpinner";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getProductSizes = (product = {}) =>
  Array.isArray(product.variants)
    ? product.variants
        .map((variant) => String(variant?.size || variant?.name || variant?.potSize || "").trim())
        .filter(Boolean)
    : [];

const ProductList = ({ token }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/list?limit=500&sortBy=createdAt&sortOrder=desc`
      );
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to fetch products");
      }

      setProducts(payload.products || []);
    } catch (productError) {
      setError(productError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    setDeletingId(productId);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ productId }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to remove product");
      }

      setProducts((prev) => prev.filter((product) => product._id !== productId));
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Product List</h1>
          <p className="text-sm text-gray-500">
            View all active products and remove outdated inventory.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchProducts}
          disabled={loading}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-10 shadow-sm">
          <MaterialSpinner
            label="Loading products"
            caption="Pulling the latest inventory from the backend."
          />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="px-3 py-3 font-medium">Product</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="px-3 py-3 font-medium">Sizes</th>
                <th className="px-3 py-3 font-medium">Stock</th>
                <th className="px-3 py-3 font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const sizeLabels = getProductSizes(product);
                const hasSizePricing = sizeLabels.length > 0;

                return (
                <tr key={product._id} className="border-b border-gray-100">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-500">
                          N/A
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-700">{product.productType || "-"}</td>
                  <td className="px-3 py-3 text-gray-700">{product.category || "-"}</td>
                  <td className="px-3 py-3 text-gray-700">
                    {hasSizePricing
                      ? `From ${formatCurrency(product.price)}`
                      : formatCurrency(product.price)}
                  </td>
                  <td className="px-3 py-3 text-gray-700">
                    {hasSizePricing ? sizeLabels.join(", ") : "-"}
                  </td>
                  <td className="px-3 py-3 text-gray-700">{product.stock ?? 0}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/edit-plant/${product._id}`)}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === product._id}
                        onClick={() => handleDelete(product._id)}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === product._id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </td>
                </tr>
              )})}

              {!products.length ? (
                <tr>
                  <td className="px-3 py-8 text-center text-sm text-gray-500" colSpan={7}>
                    No products found.
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

export default ProductList;
