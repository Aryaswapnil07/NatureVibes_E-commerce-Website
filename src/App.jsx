import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import { categories, furniture } from "./data";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductSection from "./components/ProductSection";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import CartSidebar from "./components/CartSidebar";
import StickyCartBar from "./components/StickyCartBar";
import NotFound from "./components/NotFound";
import ProductInfoPage from "./components/ProductInfo";
import CheckoutPage from "./components/CheckoutPage"; // ✅ Import Checkout component

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("natureVibesCart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("natureVibesCart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Global Total Calculation for Checkout
  const totalAmount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const handleAddToCart = useCallback((product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
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

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  /* ---------------- Home Page Content Component ---------------- */
  const HomeContent = useMemo(() => {
    const Component = ({ onAddToCart }) => (
      <>
        <Hero />
        <section id="full-catalog">
          <div className="section-header">
            <h2>Full Plant Catalog</h2>
            <p>Every variety we grow, curated for your home.</p>
          </div>
          <ProductSection {...categories.indoor} onAddToCart={onAddToCart} />
          <ProductSection {...categories.foliage} onAddToCart={onAddToCart} />
          <ProductSection {...categories.outdoor} onAddToCart={onAddToCart} />
          <ProductSection {...categories.pots} onAddToCart={onAddToCart} />
        </section>

        <section id="furniture" style={{ background: "#f4f8f4" }}>
          <div className="section-header">
            <h2>Premium Furniture</h2>
            <p>Handcrafted Sheesham & Teak wood pieces.</p>
          </div>
          <ProductSection {...furniture} onAddToCart={onAddToCart} />
        </section>

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
    );
    return React.memo(Component);
  }, []);

  return (
    <>
      <Navbar
        onOpenLogin={useCallback(() => setIsModalOpen(true), [])}
        cartCount={cartCount}
      />

      <Routes>
        <Route path="/" element={<HomeContent onAddToCart={handleAddToCart} />} />
        
        <Route 
          path="/product/:productId" 
          element={<ProductInfoPage onAddToCart={handleAddToCart} />} 
        />

        {/* ✅ NEW: Checkout Route handles Address & Razorpay */}
        <Route 
          path="/checkout" 
          element={<CheckoutPage cartItems={cartItems} totalAmount={totalAmount} />} 
        />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />

      <StickyCartBar
        cartItems={cartItems}
        onOpenCart={useCallback(() => setIsCartOpen(true), [])}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={useCallback(() => setIsCartOpen(false), [])}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemove}
      />

      <LoginModal
        isOpen={isModalOpen}
        onClose={useCallback(() => setIsModalOpen(false), [])}
      />
    </>
  );
}

export default App;