import React, { useState, useMemo, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Zap, CheckCircle } from "lucide-react";

import RelatedProducts from "./RelatedProducts";
import "../components/css/ProductInfo.css";

const ProductInfo = ({ onAddToCart, allProducts = [] }) => {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const product = useMemo(() => {
    if (location.state?.product) {
      return location.state.product;
    }
    return allProducts.find((item) => String(item.id) === String(productId));
  }, [productId, location.state, allProducts]);

  const gallery = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      return product.gallery;
    }
    if (product.image) {
      return [product.image, product.image, product.image];
    }
    return [];
  }, [product]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const activeImageIndex =
    selectedImageIndex >= 0 && selectedImageIndex < gallery.length
      ? selectedImageIndex
      : 0;
  const mainImage = gallery[activeImageIndex] || gallery[0] || "";

  useEffect(() => {
    if (product) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="error-container" style={{ padding: "150px 20px", textAlign: "center" }}>
        <h2 style={{ color: "#2e7d32" }}>Product not found</h2>
        <p>Please check the catalog and try again.</p>
      </div>
    );
  }

  return (
    <>
      <div className="nature-product-page">
        <div className="product-info-container">
          <div className="gallery-section">
            <div className="gallery-layout-wrapper">
              <div className="thumbnail-list">
                {gallery.map((image, index) => (
                  <div
                    key={`${product.id}-thumb-${index}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`thumb-wrapper ${activeImageIndex === index ? "active-thumb" : ""}`}
                  >
                    <img src={image} alt={`view-${index}`} />
                  </div>
                ))}
              </div>

              <div className="main-display-box">
                {mainImage ? (
                  <img src={mainImage} alt={product.name} className="featured-image" />
                ) : (
                  <div className="featured-image" />
                )}
              </div>
            </div>
          </div>

          <div className="details-section">
            <div className="details-header">
              <p className="category-label">{product.category}</p>
              <h1 className="product-name">{product.name}</h1>

              <div className="price-badge-row">
                <span className="product-price">
                  Rs {Number(product.price || 0).toLocaleString("en-IN")}
                </span>
                {product.badge ? <span className="promo-badge">{product.badge}</span> : null}
              </div>
            </div>

            <div className="description-block">
              <h3 className="section-subtitle">Product Description</h3>
              <p className="description-text">
                {product.description ||
                  `This ${product.name} is carefully nurtured at NatureVibes to add freshness and calm to your space.`}
              </p>
            </div>

            <div className="trust-features-card">
              <h4 className="trust-title">Why Shop From NatureVibes?</h4>
              <div className="trust-grid">
                <div className="trust-item">
                  <CheckCircle size={16} /> Healthy Plants Guaranteed
                </div>
                <div className="trust-item">
                  <CheckCircle size={16} /> Eco-friendly Packaging
                </div>
                <div className="trust-item">
                  <CheckCircle size={16} /> Fast and Secure Delivery
                </div>
                <div className="trust-item">
                  <CheckCircle size={16} /> 24/7 Expert Support
                </div>
              </div>
            </div>

            <div className="action-button-group">
              <button onClick={() => onAddToCart(product)} className="btn-secondary-outline">
                <ShoppingCart size={20} /> Add to Cart
              </button>

              <button className="btn-primary-solid" onClick={() => navigate("/checkout")}>
                <Zap size={20} /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <RelatedProducts
        allProducts={allProducts}
        currentCategory={product.category}
        currentProductId={product.id}
        onAddToCart={onAddToCart}
      />
    </>
  );
};

export default ProductInfo;
