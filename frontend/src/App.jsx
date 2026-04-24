import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import "./App.css";

import API_BASE_URL from "./config/api";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductSection from "./components/ProductSection";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import CartSidebar from "./components/CartSidebar";
import StickyCartBar from "./components/StickyCartBar";
import NotFound from "./components/NotFound";
import ProductInfoPage from "./components/ProductInfo";
import CheckoutPage from "./components/CheckoutPage";
import SuccessPage from "./components/SuccessPage";
import UserProfile from "./components/UserProfile";
import { getProductPriceInfo } from "./utils/productPricing";

const USER_TOKEN_KEY = "natureVibesUserToken";

const normalizeCategoryKey = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toSectionId = (key = "", label = "") => {
  const normalizedKey = normalizeCategoryKey(key || label || "catalog");
  return `cat-${normalizedKey || "catalog"}`;
};

const normalizeCatalogProduct = (product, fallbackIndex = 0) => {
  const primaryImage = product.images?.find((item) => item?.isPrimary)?.url;
  const firstImage = product.images?.[0]?.url;
  const image = primaryImage || firstImage || product.image || "";
  const priceInfo = getProductPriceInfo(product);

  let badge = "";
  if (product.isBestSeller) badge = "Best Seller";
  if (product.isNewArrival) badge = "New";
  if (product.isTrending) badge = "Trending";

  const categoryLabel =
    product.category || product.subCategory || product.productType || "General";
  const categoryKey = normalizeCategoryKey(
    product.categoryKey || product.category || product.subCategory || categoryLabel
  );

  return {
    id: String(product._id || product.id || `nv-item-${fallbackIndex}`),
    backendId: product._id || null,
    categoryKey,
    name: product.name || "Untitled Product",
    category: categoryLabel,
    baseCategory: product.category || "",
    subCategory: product.subCategory || "",
    productType: product.productType || "",
    brand: product.brand || "UrbanVibes",
    sku: product.sku || "",
    price: Number.isFinite(priceInfo.lowestPrice) ? priceInfo.lowestPrice : 0,
    originalPrice: Number.isFinite(priceInfo.lowestRegularPrice)
      ? priceInfo.lowestRegularPrice
      : 0,
    discountedPrice: Number.isFinite(priceInfo.lowestDiscountedPrice)
      ? priceInfo.lowestDiscountedPrice
      : 0,
    stock: priceInfo.hasVariants ? Number(priceInfo.totalStock || 0) : Number(product.stock ?? 0),
    isInStock: priceInfo.hasVariants
      ? Boolean(priceInfo.hasAnyInStock)
      : Boolean(priceInfo.isInStock),
    isPublished: product.isPublished !== false,
    tags: Array.isArray(product.tags) ? product.tags : [],
    averageRating: Number(product.averageRating || 0),
    reviewCount: Number(product.reviewCount || 0),
    shortDescription: product.shortDescription || "",
    careGuide: product.careGuide || null,
    plantDetails: product.plantDetails || null,
    shipping: product.shipping || null,
    images: Array.isArray(product.images) ? product.images : [],
    variants: priceInfo.variants,
    sizeOptions: priceInfo.sizeLabels,
    hasVariants: priceInfo.hasVariants,
    defaultSize: priceInfo.selectedVariant?.size || "",
    pricePrefix: priceInfo.hasVariants ? "From " : "",
    image,
    badge,
    description: product.description || "",
    isBestSeller: Boolean(product.isBestSeller),
    isNewArrival: Boolean(product.isNewArrival),
    isTrending: Boolean(product.isTrending),
    isFeatured: Boolean(product.isFeatured),
  };
};

const buildCatalogSections = (products = [], categories = []) => {
  const sectionMap = new Map();

  categories.forEach((category) => {
    const key = normalizeCategoryKey(category.key || category.label);
    if (!key) return;

    sectionMap.set(key, {
      key,
      id: toSectionId(key, category.label),
      title: category.label || "General",
      description: category.description || "",
      order: Number(category.order || 9999),
      products: [],
    });
  });

  products.forEach((product, index) => {
    if (product?.isDeleted) return;
    if (product?.isPublished === false) return;

    const normalizedProduct = normalizeCatalogProduct(product, index);
    const key =
      normalizeCategoryKey(normalizedProduct.categoryKey || normalizedProduct.category) ||
      `general-${index}`;

    if (!sectionMap.has(key)) {
      sectionMap.set(key, {
        key,
        id: toSectionId(key, normalizedProduct.category),
        title: normalizedProduct.category || "General",
        description: "",
        order: 9999,
        products: [],
      });
    }

    sectionMap.get(key).products.push(normalizedProduct);
  });

  return Array.from(sectionMap.values())
    .filter((section) => section.products.length > 0)
    .sort(
      (left, right) =>
        Number(left.order || 0) - Number(right.order || 0) ||
        String(left.title || "").localeCompare(String(right.title || ""))
    );
};

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catalogSections, setCatalogSections] = useState([]);
  const [catalogError, setCatalogError] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState("all");
  const [userToken, setUserToken] = useState(
    () => localStorage.getItem(USER_TOKEN_KEY) || ""
  );
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("natureVibesCart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("natureVibesCart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const loadCatalog = async () => {
      setCatalogLoading(true);
      setCatalogError("");

      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(
            `${API_BASE_URL}/api/products/list?publishedOnly=true&limit=500&sortBy=createdAt&sortOrder=desc`
          ),
          fetch(`${API_BASE_URL}/api/products/categories?publishedOnly=true`),
        ]);

        const productsPayload = await productsResponse.json();

        if (!productsResponse.ok || !productsPayload.success) {
          throw new Error(productsPayload.message || "Unable to load products");
        }

        let categoryMeta = [];
        if (categoriesResponse.ok) {
          const categoriesPayload = await categoriesResponse.json();
          if (categoriesPayload?.success && Array.isArray(categoriesPayload.categories)) {
            categoryMeta = categoriesPayload.categories;
          }
        }

        const sections = buildCatalogSections(productsPayload.products || [], categoryMeta);
        setCatalogSections(sections);
      } catch (error) {
        setCatalogSections([]);
        setCatalogError(error.message || "Unable to load products from backend");
      } finally {
        setCatalogLoading(false);
      }
    };

    loadCatalog();
  }, []);

  const fetchUserProfile = useCallback(async () => {
    if (!userToken) {
      setUserProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          token: userToken,
          Authorization: `Bearer ${userToken}`,
        },
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to load profile");
      }

      setUserProfile(payload.user || null);
    } catch {
      setUserProfile(null);
      localStorage.removeItem(USER_TOKEN_KEY);
      setUserToken("");
    } finally {
      setProfileLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const allProducts = useMemo(
    () => catalogSections.flatMap((section) => section.products),
    [catalogSections]
  );

  const sizeFilterOptions = useMemo(() => {
    const sizeLabels = new Set();

    catalogSections.forEach((section) => {
      section.products.forEach((product) => {
        (product.sizeOptions || []).forEach((size) => {
          if (size) {
            sizeLabels.add(size);
          }
        });
      });
    });

    return Array.from(sizeLabels).sort((left, right) =>
      left.localeCompare(right, undefined, { sensitivity: "base", numeric: true })
    );
  }, [catalogSections]);

  const filteredCatalogSections = useMemo(() => {
    if (selectedSizeFilter === "all") {
      return catalogSections;
    }

    return catalogSections
      .map((section) => ({
        ...section,
        products: section.products.filter((product) =>
          (product.sizeOptions || []).includes(selectedSizeFilter)
        ),
      }))
      .filter((section) => section.products.length > 0);
  }, [catalogSections, selectedSizeFilter]);

  useEffect(() => {
    if (selectedSizeFilter === "all") {
      return;
    }

    if (!sizeFilterOptions.includes(selectedSizeFilter)) {
      setSelectedSizeFilter("all");
    }
  }, [selectedSizeFilter, sizeFilterOptions]);

  const totalAmount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem("natureVibesCart");
  }, []);

  const handleAddToCart = useCallback((product) => {
    const availableStock = Number(product?.stock ?? 0);
    if (!product?.id || !Number.isFinite(availableStock) || availableStock <= 0) {
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= availableStock) {
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, availableStock),
              }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const handleUpdateQty = useCallback((id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const stockLimit = Number(item.stock ?? 0);
            const tentativeQty = item.quantity + delta;
            const newQty =
              delta > 0 && Number.isFinite(stockLimit) && stockLimit > 0
                ? Math.min(tentativeQty, stockLimit)
                : tentativeQty;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const handleRemove = useCallback((id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleOpenLogin = useCallback(() => setIsModalOpen(true), []);
  const handleOpenCart = useCallback(() => setIsCartOpen(true), []);
  const handleCloseCart = useCallback(() => setIsCartOpen(false), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  const handleAuthSuccess = useCallback((token) => {
    localStorage.setItem(USER_TOKEN_KEY, token);
    setUserToken(token);
    setIsModalOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(USER_TOKEN_KEY);
    setUserToken("");
    setUserProfile(null);
  }, []);

  return (
    <>
      <Navbar
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        isLoggedIn={Boolean(userToken)}
        cartCount={cartCount}
        allProducts={allProducts}
        catalogSections={catalogSections}
      />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <section id="full-catalog">
                <div className="section-header">
                  <h2>Full Plant Catalog</h2>
                  <p>Shop category-wise plants and accessories curated for every space.</p>
                </div>
                {sizeFilterOptions.length > 0 ? (
                  <div className="catalog-filter-bar">
                    <span className="catalog-filter-label">Filter by size</span>
                    <div className="catalog-filter-chips">
                      <button
                        type="button"
                        className={`catalog-filter-chip ${
                          selectedSizeFilter === "all" ? "active" : ""
                        }`}
                        onClick={() => setSelectedSizeFilter("all")}
                      >
                        All Sizes
                      </button>
                      {sizeFilterOptions.map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={`catalog-filter-chip ${
                            selectedSizeFilter === size ? "active" : ""
                          }`}
                          onClick={() => setSelectedSizeFilter(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                {catalogError ? (
                  <div
                    style={{
                      margin: "0 auto 24px",
                      maxWidth: "960px",
                      padding: "10px 14px",
                      border: "1px solid #f5c2c7",
                      background: "#fff5f5",
                      color: "#842029",
                      borderRadius: "10px",
                    }}
                  >
                    Backend connection issue: {catalogError}
                  </div>
                ) : null}
                {catalogLoading ? (
                  <p style={{ textAlign: "center", color: "#2e7d32" }}>
                    Loading products from backend...
                  </p>
                ) : null}

                {!catalogLoading && filteredCatalogSections.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#6c757d" }}>
                    {selectedSizeFilter === "all"
                      ? "No products are currently available."
                      : `No products are available in size "${selectedSizeFilter}".`}
                  </p>
                ) : null}

                {filteredCatalogSections.map((section) => (
                  <ProductSection
                    key={section.key}
                    title={section.title}
                    id={section.id}
                    products={section.products}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </section>

              <section className="about-section" id="about">
                <div className="about-content">
                  <h2>About UrbanVibes</h2>
                  <p>
                    UrbanVibes brings curated plants, seeds, and plant-care essentials for
                    modern homes and gardens.
                  </p>
                </div>
              </section>
            </>
          }
        />

        <Route
          path="/product/:productId"
          element={
            <ProductInfoPage allProducts={allProducts} onAddToCart={handleAddToCart} />
          }
        />

        <Route
          path="/checkout"
          element={
            <CheckoutPage
              cartItems={cartItems}
              totalAmount={totalAmount}
              clearCart={clearCart}
              userProfile={userProfile}
              userToken={userToken}
              onRequireLogin={handleOpenLogin}
            />
          }
        />

        <Route
          path="/account/profile"
          element={
            <UserProfile
              userProfile={userProfile}
              isLoading={profileLoading}
              isLoggedIn={Boolean(userToken)}
              userToken={userToken}
              onRefreshProfile={fetchUserProfile}
              section="profile"
              onOpenLogin={handleOpenLogin}
              onLogout={handleLogout}
            />
          }
        />

        <Route
          path="/account/orders/current"
          element={
            <UserProfile
              userProfile={userProfile}
              isLoading={profileLoading}
              isLoggedIn={Boolean(userToken)}
              userToken={userToken}
              onRefreshProfile={fetchUserProfile}
              section="current-orders"
              onOpenLogin={handleOpenLogin}
              onLogout={handleLogout}
            />
          }
        />

        <Route
          path="/account/orders/history"
          element={
            <UserProfile
              userProfile={userProfile}
              isLoading={profileLoading}
              isLoggedIn={Boolean(userToken)}
              userToken={userToken}
              onRefreshProfile={fetchUserProfile}
              section="order-history"
              onOpenLogin={handleOpenLogin}
              onLogout={handleLogout}
            />
          }
        />

        <Route
          path="/account/addresses"
          element={
            <UserProfile
              userProfile={userProfile}
              isLoading={profileLoading}
              isLoggedIn={Boolean(userToken)}
              userToken={userToken}
              onRefreshProfile={fetchUserProfile}
              section="addresses"
              onOpenLogin={handleOpenLogin}
              onLogout={handleLogout}
            />
          }
        />

        <Route
          path="/profile"
          element={<Navigate to="/account/profile" replace />}
        />

        <Route
          path="/account"
          element={<Navigate to="/account/profile" replace />}
        />

        <Route
          path="/my-orders"
          element={<Navigate to="/account/orders/current" replace />}
        />

        <Route
          path="/order-history"
          element={<Navigate to="/account/orders/history" replace />}
        />

        <Route
          path="/my-addresses"
          element={<Navigate to="/account/addresses" replace />}
        />

        <Route
          path="/logout"
          element={
            <UserProfile
              userProfile={userProfile}
              isLoading={profileLoading}
              isLoggedIn={Boolean(userToken)}
              userToken={userToken}
              onRefreshProfile={fetchUserProfile}
              section="profile"
              onOpenLogin={handleOpenLogin}
              onLogout={handleLogout}
              autoLogout
            />
          }
        />

        <Route
          path="/account/logout"
          element={
            <UserProfile
              userProfile={userProfile}
              isLoading={profileLoading}
              isLoggedIn={Boolean(userToken)}
              userToken={userToken}
              onRefreshProfile={fetchUserProfile}
              section="profile"
              onOpenLogin={handleOpenLogin}
              onLogout={handleLogout}
              autoLogout
            />
          }
        />

        <Route path="/success" element={<SuccessPage clearCart={clearCart} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />

      <StickyCartBar
        cartItems={cartItems}
        totalAmount={totalAmount}
        onOpenCart={handleOpenCart}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        cartItems={cartItems}
        totalAmount={totalAmount}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemove}
        isLoggedIn={Boolean(userToken)}
        onRequireLogin={handleOpenLogin}
      />

      <LoginModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}

export default App;
