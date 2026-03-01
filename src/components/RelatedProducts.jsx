import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import "../components/css/relatedProduct.css";

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
              <div className="related-price-row">
                <span className="related-price">
                  Rs {Number(item.price || 0).toLocaleString("en-IN")}
                </span>
                <button
                  className="related-add-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    onAddToCart(item);
                  }}
                  title="Add to Cart"
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
