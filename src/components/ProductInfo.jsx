import React, { useState, useMemo, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { categories, furniture } from "../data"; 
import { ShoppingCart, Zap, CheckCircle } from "lucide-react";
import "../components/css/ProductInfo.css"; 

const ProductInfo = ({ onAddToCart }) => {
  const { productId } = useParams();
  const location = useLocation();

  const product = useMemo(() => {
    if (location.state?.product) return location.state.product;
    const allProducts = [
      ...Object.values(categories).flatMap((cat) => cat.products),
      ...furniture.products,
    ];
    return allProducts.find((p) => String(p.id) === String(productId));
  }, [productId, location.state]);

  const [mainImage, setMainImage] = useState(product?.image);

  useEffect(() => {
    if (product) setMainImage(product.image);
    window.scrollTo(0, 0);
  }, [product]);

  if (!product) {
    return (
      <div className="error-container">
        <h2>Product not found!</h2>
      </div>
    );
  }

  const gallery = [product.image, product.image, product.image];

  return (
    <div className="nature-product-page">
      <div className="product-info-container">
        
        {/* LEFT SIDE: Image Gallery Section */}
        <div className="gallery-section">
          <div className="gallery-layout-wrapper">
            {/* Thumbnails */}
            <div className="thumbnail-list">
              {gallery.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(img)}
                  className={`thumb-wrapper ${mainImage === img ? "active-thumb" : ""}`}
                >
                  <img src={img} alt="thumbnail" />
                </div>
              ))}
            </div>
            {/* Main Display */}
            <div className="main-display-box">
              <img
                src={mainImage}
                alt={product.name}
                className="featured-image"
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Content Section */}
        <div className="details-section">
          <div className="details-header">
            <p className="category-label">{product.category}</p>
            <h1 className="product-name">{product.name}</h1>
            
            <div className="price-badge-row">
              <span className="product-price">₹{product.price.toLocaleString("en-IN")}</span>
              {product.badge && (
                <span className="promo-badge">{product.badge}</span>
              )}
            </div>
          </div>

          <div className="description-block">
            <h3 className="section-subtitle">Product Description</h3>
            <p className="description-text">
              This {product.name} is carefully nurtured at Nature Vibes to ensure it brings
              the perfect touch of greenery and freshness to your space.
            </p>
          </div>

          {/* Trust Features */}
          <div className="trust-features-card">
            <h4 className="trust-title">Why Shop From Nature Vibes?</h4>
            <div className="trust-grid">
              <div className="trust-item"><CheckCircle size={16} /> Healthy Plants Guaranteed</div>
              <div className="trust-item"><CheckCircle size={16} /> Eco-friendly Packaging</div>
              <div className="trust-item"><CheckCircle size={16} /> Fast & Secure Delivery</div>
              <div className="trust-item"><CheckCircle size={16} /> 24/7 Expert Support</div>
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
  );
};

export default ProductInfo;