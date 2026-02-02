import React, { useState, useEffect } from "react";
import "./App.css";

import { categories, furniture } from "./data";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductSection from "./components/ProductSection";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import CartSidebar from "./components/CartSidebar";
import StickyCartBar from "./components/StickyCartBar";
import AdminAddPlant from "./components/AdminaddPlant";

function App() {
  // -------------------- STATE --------------------
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cart (LocalStorage)
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("natureVibesCart");
    return saved ? JSON.parse(saved) : [];
  });

  // Persist cart
  useEffect(() => {
    localStorage.setItem("natureVibesCart", JSON.stringify(cartItems));
  }, [cartItems]);

  // -------------------- CART HANDLERS --------------------
  const handleAddToCart = (product) => {
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
  };

  const handleUpdateQty = (id, delta) => {
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
  };

  const handleRemove = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // -------------------- RENDER --------------------
  return (
    <>
      <Navbar
        onOpenLogin={() => setIsModalOpen(true)}
        cartCount={cartCount}
      />

      <Hero />

      {/* Full Catalog */}
      <section id="full-catalog">
        <div className="section-header">
          <h2>Full Plant Catalog</h2>
          <p>Every variety we grow, curated for your home.</p>
        </div>

        <ProductSection
          {...categories.indoor}
          onAddToCart={handleAddToCart}
        />
        <ProductSection
          {...categories.foliage}
          onAddToCart={handleAddToCart}
        />
        <ProductSection
          {...categories.outdoor}
          onAddToCart={handleAddToCart}
        />
        <ProductSection
          {...categories.pots}
          onAddToCart={handleAddToCart}
        />
      </section>

      {/* Furniture */}
      <section id="furniture" style={{ background: "#f4f8f4" }}>
        <div className="section-header">
          <h2>Premium Furniture</h2>
          <p>Handcrafted Sheesham & Teak wood pieces.</p>
        </div>

        <ProductSection
          {...furniture}
          onAddToCart={handleAddToCart}
        />
      </section>

      {/* About */}
      <section className="about-section" id="about">
        <div className="about-content">
          <h2>About NatureVibes</h2>
          <p>
            NatureVibes blends modern furniture with living greenery to create
            calm, sustainable homes.
          </p>
        </div>
      </section>

      <Footer />

      {/* -------------------- OVERLAYS -------------------- */}
      <StickyCartBar
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemove}
      />

      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />


    
    </>
  );
}

export default App;
