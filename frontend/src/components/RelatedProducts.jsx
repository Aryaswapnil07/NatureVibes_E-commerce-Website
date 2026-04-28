import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import "../components/css/relatedProduct.css";
import { createCartProductSnapshot } from "../utils/productPricing";

const RelatedProducts = ({
  allProducts = [],
  currentCategory,
  currentProductId,
  onAddToCart,
}) => {
  const navigate = useNavigate();

  const relatedItems = useMemo(() => {
    return allProducts
      .filter(
        (product) =>
          product.category === currentCategory &&
          String(product.id) !== String(currentProductId)
      )
      .slice(0, 8);
  }, [allProducts, currentCategory, currentProductId]);

  if (relatedItems.length === 0) return null;

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuickAction = (event, product) => {
    event.stopPropagation();

    if (!product.isInStock) return;

    const requiresSelection = Array.isArray(product.variants) && product.variants.length > 1;
    if (requiresSelection) {
      handleProductClick(product);
      return;
    }

    onAddToCart(createCartProductSnapshot(product));
  };

  return (
    <section className="related-section">
      <div className="related-header">
        <h2 className="related-title">You May Also Like</h2>
        <p className="related-subtitle">Handpicked greenery similar to this</p>
      </div>

      <div className="related-scroll-container">
        {relatedItems.map((item) => (
          <div key={item.id} className="related-card">
            <div
              className="related-img-box"
              onClick={() => handleProductClick(item)}
              style={{ cursor: "pointer" }}
            >
              <img src={item.image} alt={item.name} />
              {item.badge ? <span className="related-badge">{item.badge}</span> : null}
            </div>

            <div className="related-info">
              <span className="related-item-cat">{item.category}</span>
              <h4
                className="related-item-name"
                onClick={() => handleProductClick(item)}
                style={{ cursor: "pointer" }}
              >
                {item.name}
              </h4>
              {item.sizeOptions?.length ? (
                <p className="related-size-summary">
                  Sizes: {item.sizeOptions.slice(0, 2).join(", ")}
                  {item.sizeOptions.length > 2 ? " +" : ""}
                </p>
              ) : null}
              {item.colorOptions?.length ? (
                <p className="related-color-summary">
                  Colors: {item.colorOptions.slice(0, 2).join(", ")}
                  {item.colorOptions.length > 2 ? " +" : ""}
                </p>
              ) : null}
              <div className="related-price-row">
                <span className="related-price">
                  {item.pricePrefix || ""}Rs {Number(item.price || 0).toLocaleString("en-IN")}
                </span>
                <button
                  className="related-add-btn"
                  disabled={!item.isInStock}
                  onClick={(event) => handleQuickAction(event, item)}
                  title={
                    item.isInStock
                      ? Array.isArray(item.variants) && item.variants.length > 1
                        ? "Choose options"
                        : "Add to Cart"
                      : "Out of Stock"
                  }
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(RelatedProducts);
