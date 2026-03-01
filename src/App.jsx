import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import "./App.css";

import { categories as staticCategories, furniture as staticFurniture } from "./data";
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

const sectionTemplate = {
  indoor: { title: "Indoor & Hardy", id: "cat-indoor", products: [] },
  foliage: { title: "Foliage & Vining", id: "cat-foliage", products: [] },
  outdoor: { title: "Outdoor & Blooms", id: "cat-outdoor", products: [] },
  seeds: { title: "Seeds & Bulbs", id: "cat-seeds", products: [] },
  pots: { title: "Pots & Care Tools", id: "cat-pots", products: [] },
  furniture: { title: "Premium Furniture", id: "furniture", products: [] },
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

  return {
    id: String(product._id || product.id || `nv-item-${fallbackIndex}`),
    backendId: product._id || null,
    name: product.name || "Untitled Product",
    category: product.subCategory || product.category || product.productType || "General",
    price: Number.isFinite(price) ? price : 0,
    image,
    badge,
    description: product.description || "",
  };
};

const resolveSectionKey = (product) => {
  const categoryText = `${product.category || ""} ${product.subCategory || ""}`
    .toLowerCase()
    .trim();
  const type = (product.productType || "").toLowerCase();

  if (categoryText.includes("furniture") || type === "subscription") {
    return "furniture";
  }

  if (
    ["seed", "bulb"].includes(type) ||
    /(seed|seeds|bulb|microgreen|herb|tree|grass|kit)/.test(categoryText)
  ) {
    return "seeds";
  }

  if (
    ["pot", "planter", "soil", "fertilizer", "tool"].includes(type) ||
    /(pot|tool|care|soil|fertilizer|planter|stand|tray|basket|printed)/.test(
      categoryText
    )
  ) {
    return "pots";
  }

  if (
    /(outdoor|flower|fruit|bloom|garden)/.test(categoryText) ||
    type === "bulb"
  ) {
    return "outdoor";
  }

  if (
    /(foliage|vining|vine|money|pothos|monstera|low light|air purifying|pet-friendly|succulent|hanging|indoor|low maintenance|xl)/.test(
      categoryText
    )
  ) {
    return "foliage";
  }

  return "indoor";
};

const buildSectionsFromStatic = () => {
  const sections = JSON.parse(JSON.stringify(sectionTemplate));

  Object.entries(staticCategories).forEach(([key, section]) => {
    sections[key] = {
      title: section.title?.replace(/[^\x20-\x7E]/g, "").trim() || sections[key].title,
      id: section.id || sections[key].id,
      products: (section.products || []).map((item, index) =>
        normalizeCatalogProduct(item, index)
      ),
    };
  });

  sections.furniture = {
    title: staticFurniture.title || sectionTemplate.furniture.title,
    id: staticFurniture.id || sectionTemplate.furniture.id,
    products: (staticFurniture.products || []).map((item, index) =>
      normalizeCatalogProduct(item, index + 1000)
    ),
  };

  return sections;
};

const buildSectionsFromBackend = (products = []) => {
  const sections = JSON.parse(JSON.stringify(sectionTemplate));
  products.forEach((product, index) => {
    if (product?.isDeleted) return;
    if (product?.isPublished === false) return;
    const normalized = normalizeCatalogProduct(product, index);
    const sectionKey = resolveSectionKey(product);
    sections[sectionKey].products.push(normalized);
  });
  return sections;
};

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catalogSections, setCatalogSections] = useState(() => buildSectionsFromStatic());
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
        const response = await fetch(`${API_BASE_URL}/api/products/list?publishedOnly=true`);
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Unable to load products");
        }

        const sections = buildSectionsFromBackend(payload.products || []);
        const totalProducts = Object.values(sections).reduce(
          (acc, section) => acc + section.products.length,
          0
        );

        if (totalProducts > 0) {
          setCatalogSections(sections);
        }
      } catch (error) {
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
        headers: { token: userToken },
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to load profile");
      }

      setUserProfile(payload.user || null);
    } catch {
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const allProducts = useMemo(
    () => Object.values(catalogSections).flatMap((section) => section.products),
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
  }, []);

  return (
    <>
      <Navbar
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        isLoggedIn={Boolean(userToken)}
        cartCount={cartCount}
        allProducts={allProducts}
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
                  <p>Every variety we grow, curated for your home.</p>
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
                    Backend connection issue: {catalogError}. Showing available data.
                  </div>
                ) : null}
                {catalogLoading ? (
                  <p style={{ textAlign: "center", color: "#2e7d32" }}>
                    Loading products from backend...
                  </p>
                ) : null}
                <ProductSection
                  {...catalogSections.indoor}
                  onAddToCart={handleAddToCart}
                />
                <ProductSection
                  {...catalogSections.foliage}
                  onAddToCart={handleAddToCart}
                />
                <ProductSection
                  {...catalogSections.outdoor}
                  onAddToCart={handleAddToCart}
                />
                {catalogSections.seeds.products.length > 0 ? (
                  <ProductSection
                    {...catalogSections.seeds}
                    onAddToCart={handleAddToCart}
                  />
                ) : null}
                <ProductSection {...catalogSections.pots} onAddToCart={handleAddToCart} />
              </section>

              {catalogSections.furniture.products.length > 0 ? (
                <section id="furniture" style={{ background: "#f4f8f4" }}>
                  <div className="section-header">
                    <h2>Premium Furniture</h2>
                    <p>Handcrafted Sheesham & Teak wood pieces.</p>
                  </div>
                  <ProductSection
                    {...catalogSections.furniture}
                    onAddToCart={handleAddToCart}
                  />
                </section>
              ) : null}

              <section className="about-section" id="about">
                <div className="about-content">
                  <h2>About NatureVibes</h2>
                  <p>
                    NatureVibes blends modern furniture with living greenery to bring
                    harmony, calm, and freshness into your home.
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
