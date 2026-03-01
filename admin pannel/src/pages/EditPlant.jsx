import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../config/api";
import { CATEGORY_OPTIONS, PRODUCT_TYPE_OPTIONS } from "../constants/productOptions";

const imageSlots = [
  { key: "image1", label: "Front View (Image 1)" },
  { key: "image2", label: "Left Angle (Image 2)" },
  { key: "image3", label: "Right Angle (Image 3)" },
  { key: "image4", label: "Top/Close Angle (Image 4)" },
];

const emptyImageFiles = {
  image1: null,
  image2: null,
  image3: null,
  image4: null,
};

const defaultForm = {
  name: "",
  description: "",
  shortDescription: "",
  productType: "live_plant",
  category: "Indoor Plants",
  subCategory: "",
  tags: "",
  price: "",
  discountedPrice: "",
  stock: "",
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
  isTrending: false,
  isPublished: false,
};

const EditPlant = ({ token }) => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(defaultForm);
  const [imageFiles, setImageFiles] = useState(emptyImageFiles);
  const [currentImages, setCurrentImages] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const categoryOptions = CATEGORY_OPTIONS.includes(form.category)
    ? CATEGORY_OPTIONS
    : [form.category, ...CATEGORY_OPTIONS].filter(Boolean);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoadingData(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/products/single`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Unable to load product");
        }

        const product = payload.product;
        setForm({
          name: product.name || "",
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          productType: product.productType || "live_plant",
          category: product.category || "",
          subCategory: product.subCategory || "",
          tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
          price: product.price ?? "",
          discountedPrice: product.discountedPrice ?? "",
          stock: product.stock ?? "",
          isFeatured: Boolean(product.isFeatured),
          isBestSeller: Boolean(product.isBestSeller),
          isNewArrival: Boolean(product.isNewArrival),
          isTrending: Boolean(product.isTrending),
          isPublished: Boolean(product.isPublished),
        });
        setCurrentImages(product.images || []);
      } catch (loadError) {
        setError(loadError.message || "Unable to load product");
      } finally {
        setLoadingData(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (slotKey, file) => {
    setImageFiles((prev) => ({
      ...prev,
      [slotKey]: file || null,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoadingSubmit(true);
    setError("");
    setMessage("");

    try {
      const payload = new FormData();
      payload.append("productId", productId);
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("shortDescription", form.shortDescription);
      payload.append("productType", form.productType);
      payload.append("category", form.category);
      payload.append("subCategory", form.subCategory);
      payload.append("tags", form.tags);
      payload.append("price", form.price);
      payload.append("discountedPrice", form.discountedPrice || 0);
      payload.append("stock", form.stock || 0);
      payload.append("isFeatured", String(form.isFeatured));
      payload.append("isBestSeller", String(form.isBestSeller));
      payload.append("isNewArrival", String(form.isNewArrival));
      payload.append("isTrending", String(form.isTrending));
      payload.append("isPublished", String(form.isPublished));

      imageSlots.forEach(({ key }) => {
        if (imageFiles[key]) {
          payload.append(key, imageFiles[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/products/update`, {
        method: "PATCH",
        headers: { token },
        body: payload,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update product");
      }

      setMessage("Product updated successfully.");
      setCurrentImages(data.product?.images || currentImages);
      setImageFiles(emptyImageFiles);
    } catch (submitError) {
      setError(submitError.message || "Unable to update product");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingData) {
    return <p className="text-sm text-gray-500">Loading product details...</p>;
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Plant</h1>
          <p className="text-sm text-gray-500">
            Update plant details and upload 3-4 new angle images if needed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/list")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Back to List
        </button>
      </div>

      {message ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <form
        className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="name">
            Product Name
          </label>
          <input
            id="name"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="productType">
            Product Type
          </label>
          <select
            id="productType"
            name="productType"
            value={form.productType}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
          >
            {PRODUCT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
          />
        </div>

        <div className="lg:col-span-2">
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="shortDescription"
          >
            Short Description
          </label>
          <input
            id="shortDescription"
            name="shortDescription"
            value={form.shortDescription}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="price">
            Price
          </label>
          <input
            id="price"
            name="price"
            required
            min="1"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="discountedPrice"
          >
            Discounted Price
          </label>
          <input
            id="discountedPrice"
            name="discountedPrice"
            min="0"
            type="number"
            value={form.discountedPrice}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="stock">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            min="0"
            type="number"
            value={form.stock}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="subCategory">
            Sub Category
          </label>
          <input
            id="subCategory"
            name="subCategory"
            value={form.subCategory}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="tags">
            Tags (comma separated)
          </label>
          <input
            id="tags"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
          />
        </div>

        <div className="lg:col-span-2 rounded-md border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-semibold text-gray-700">Product Flags</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isBestSeller"
                checked={form.isBestSeller}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              Best Seller
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isNewArrival"
                checked={form.isNewArrival}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              New Arrival
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isTrending"
                checked={form.isTrending}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              Trending
            </label>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-md border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-semibold text-gray-700">Current Images</p>
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {currentImages.length > 0 ? (
              currentImages.map((image, index) => (
                <img
                  key={`${image.url}-${index}`}
                  src={image.url}
                  alt={image.alt || `plant-${index + 1}`}
                  className="h-24 w-full rounded-md border border-gray-200 object-cover"
                />
              ))
            ) : (
              <p className="col-span-4 text-sm text-gray-500">No existing images.</p>
            )}
          </div>

          <p className="mb-3 text-sm font-semibold text-gray-700">
            Upload New Plant Angles (3-4 recommended)
          </p>
          <p className="mb-3 text-xs text-gray-500">
            If you upload any new image here, existing gallery images will be replaced.
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {imageSlots.map((slot) => (
              <div key={slot.key}>
                <label className="mb-1 block text-xs font-medium text-gray-600" htmlFor={slot.key}>
                  {slot.label}
                </label>
                <input
                  id={slot.key}
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleImageChange(slot.key, event.target.files?.[0] || null)
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                />
                {imageFiles[slot.key] ? (
                  <p className="mt-1 truncate text-xs text-green-700">
                    Selected: {imageFiles[slot.key].name}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 lg:col-span-2">
          <input
            type="checkbox"
            name="isPublished"
            checked={form.isPublished}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          Publish product
        </label>

        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={loadingSubmit}
            className="rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingSubmit ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditPlant;
