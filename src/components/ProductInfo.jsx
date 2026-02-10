import React, { useState, useMemo, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { categories, furniture } from "../data"; 
import { ShoppingCart, Zap, CheckCircle } from "lucide-react";

// Components & CSS
import RelatedProducts from "./RelatedProducts"; 
import "../components/css/ProductInfo.css"; 

const ProductInfo = ({ onAddToCart }) => {
  const { productId } = useParams();
  const location = useLocation();

  /* 1. DATA LOGIC: Find product in nested data or state */
  const product = useMemo(() => {
    // Check if data was passed through navigation state first
    if (location.state?.product) return location.state.product;

    // Otherwise, search through categories and furniture objects from data.js
    const allProducts = [
      ...Object.values(categories).flatMap((cat) => cat.products),
      ...furniture.products,
    ];
    
    // Convert to string to ensure matching works regardless of type
    return allProducts.find((p) => String(p.id) === String(productId));
  }, [productId, location.state]);

  /* 2. IMAGE GALLERY STATE */
  const [mainImage, setMainImage] = useState(product?.image);

  /* 3. SIDE EFFECTS: Sync image and scroll to top on product change */
  useEffect(() => {
    if (product) {
      setMainImage(product.image);
      // Smooth scroll to top when switching between related products
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product]);

  /* 4. ERROR HANDLING */
  if (!product) {
    return (
      <div className="error-container" style={{ padding: "150px 20px", textAlign: "center" }}>
        <h2 style={{ color: "#2e7d32" }}>Product not found!</h2>
        <p>Please check the catalog or try again.</p>
      </div>
    );
  }

  // Gallery Placeholders (using same image since data is single-image based)
  const gallery = [product.image, product.image, product.image];

  return (
    <>
      <div className="nature-product-page">
        <div className="product-info-container">
          
          {/* --- LEFT SIDE: Image Gallery --- */}
          <div className="gallery-section">
            <div className="gallery-layout-wrapper">
              {/* Vertical Thumbnail List */}
              <div className="thumbnail-list">
                {gallery.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`thumb-wrapper ${mainImage === img ? "active-thumb" : ""}`}
                  >
                    <img src={img} alt={`view-${index}`} />
                  </div>
                ))}
              </div>

              {/* Large Display Box */}
              <div className="main-display-box">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="featured-image"
                />
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDE: Details & Purchase --- */}
          <div className="details-section">
            <div className="details-header">
              <p className="category-label">{product.category}</p>
              <h1 className="product-name">{product.name}</h1>
              
              <div className="price-badge-row">
                <span className="product-price">
                    ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.badge && (
                  <span className="promo-badge">{product.badge}</span>
                )}
              </div>
            </div>

            <div className="description-block">
              <h3 className="section-subtitle">Product Description</h3>
              <p className="description-text">
                This {product.name} is carefully nurtured at Nature Vibes to ensure it brings
                the perfect touch of greenery and freshness to your space. Our products are
                hand-picked for their health, durability, and aesthetic appeal.
              </p>
            </div>

            {/* Nature Vibes Trust Box */}
            <div className="trust-features-card">
              <h4 className="trust-title">Why Shop From Nature Vibes?</h4>
              <div className="trust-grid">
                <div className="trust-item">
                    <CheckCircle size={16} /> Healthy Plants Guaranteed
                </div>
                <div className="trust-item">
                    <CheckCircle size={16} /> Eco-friendly Packaging
                </div>
                <div className="trust-item">
                    <CheckCircle size={16} /> Fast & Secure Delivery
                </div>
                <div className="trust-item">
                    <CheckCircle size={16} /> 24/7 Expert Support
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-button-group">
              <button 
                onClick={() => onAddToCart(product)}
                className="btn-secondary-outline"
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>
              
              <button className="btn-primary-solid">
                <Zap size={20} /> Buy Now
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* --- SIMILAR PRODUCTS SECTION --- */}
      <RelatedProducts 
        currentCategory={product.category} 
        currentProductId={product.id} 
        onAddToCart={onAddToCart} 
      />
    </>
  );
};

export default ProductInfo;