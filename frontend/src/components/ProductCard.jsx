import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCartProductSnapshot } from "../utils/productPricing";

const ProductCard = ({ product, onAdd }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleViewDetails = () => {
    navigate(`/product/${product.id}`, { state: { product } });
    window.scrollTo(0, 0);
  };

  const sizeSummary = Array.isArray(product.sizeOptions) ? product.sizeOptions.slice(0, 3) : [];
  const colorSummary = Array.isArray(product.colorOptions)
    ? product.colorOptions.slice(0, 3)
    : [];
  const canAddToCart = Boolean(product.isInStock);

  const handleQuickAction = (event) => {
    event.stopPropagation();

    if (!canAddToCart) return;

    const requiresSelection = Array.isArray(product.variants) && product.variants.length > 1;
    if (requiresSelection) {
      handleViewDetails();
      return;
    }

    onAdd(createCartProductSnapshot(product));
  };

  return (
    <div ref={cardRef} className={`product-card category-card ${isVisible ? "show" : ""}`}>
      {product.badge ? <div className="badge">{product.badge}</div> : null}

      <div className="product-img-box" onClick={handleViewDetails} style={{ cursor: "pointer" }}>
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-info">
        <span className="product-cat">{product.category}</span>

        <h4 className="product-title" onClick={handleViewDetails} style={{ cursor: "pointer" }}>
          {product.name}
        </h4>

        {sizeSummary.length ? (
          <p className="product-size-summary">
            Sizes: {sizeSummary.join(", ")}
            {product.sizeOptions.length > sizeSummary.length ? " +" : ""}
          </p>
        ) : null}

        {colorSummary.length ? (
          <p className="product-color-summary">
            Colors: {colorSummary.join(", ")}
            {product.colorOptions.length > colorSummary.length ? " +" : ""}
          </p>
        ) : null}

        <div className="price-action-row">
          <span className="current-price">
            {product.pricePrefix ? (
              <span className="current-price-prefix">{product.pricePrefix}</span>
            ) : null}
            {`\u20B9${product.price.toLocaleString("en-IN")}`}
          </span>
          <button
            className="add-btn-icon"
            disabled={!canAddToCart}
            title={
              canAddToCart
                ? Array.isArray(product.variants) && product.variants.length > 1
                  ? "Choose options"
                  : "Add to cart"
                : "Out of stock"
            }
            onClick={handleQuickAction}
          >
            <span className="material-icons">
              {canAddToCart
                ? Array.isArray(product.variants) && product.variants.length > 1
                  ? "tune"
                  : "add"
                : "block"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
