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

  const regularPrice = Number(product.price || 0);
  const discountedPrice = Number(product.discountedPrice || 0);
  const price = discountedPrice > 0 ? discountedPrice : regularPrice;

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
    brand: product.brand || "NatureVibes",
    sku: product.sku || "",
    price: Number.isFinite(price) ? price : 0,
    originalPrice: Number.isFinite(regularPrice) ? regularPrice : 0,
    discountedPrice: Number.isFinite(discountedPrice) ? discountedPrice : 0,
    stock: Number(product.stock ?? 0),
    isInStock: product.isInStock !== false,
    isPublished: product.isPublished !== false,
    tags: Array.isArray(product.tags) ? product.tags : [],
    averageRating: Number(product.averageRating || 0),
    reviewCount: Number(product.reviewCount || 0),
    shortDescription: product.shortDescription || "",
    careGuide: product.careGuide || null,
    plantDetails: product.plantDetails || null,
    shipping: product.shipping || null,
    images: Array.isArray(product.images) ? product.images : [],
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
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
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
            const newQty = item.quantity + delta;
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

                {!catalogLoading && catalogSections.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#6c757d" }}>
                    No products are currently available.
                  </p>
                ) : null}

                {catalogSections.map((section) => (
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
                  <h2>About NatureVibes</h2>
                  <p>
                    NatureVibes brings curated plants, seeds, and plant-care essentials for
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
