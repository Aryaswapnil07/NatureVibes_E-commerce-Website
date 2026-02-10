import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { categories, furniture } from "../data"; // ✅ Importing your data structure
import { ShoppingCart } from "lucide-react";
import "../components/css/relatedProduct.css";

const RelatedProducts = ({ currentCategory, currentProductId, onAddToCart }) => {
  const navigate = useNavigate();

  const relatedItems = useMemo(() => {
    // 1. Flatten all categories into a single array of products
    const plantProducts = Object.values(categories).flatMap((cat) => cat.products);
    
    // 2. Combine with furniture products
    const allProducts = [...plantProducts, ...furniture.products];

    // 3. Filter by category (e.g., "Snake Plant" or "Indoor") 
    // and exclude the product the user is currently looking at
    return allProducts
      .filter((p) => 
        p.category === currentCategory && 
        String(p.id) !== String(currentProductId)
      )
      .slice(0, 8); // Limit to 8 items for the scroll effect
  }, [currentCategory, currentProductId]);

  // Don't render the section if no similar products are found
  if (relatedItems.length === 0) return null;

  const handleProductClick = (product) => {
    // Navigate and pass the product data in state
    navigate(`/product/${product.id}`, { state: { product } });
    // Scroll to top so the new product info is visible
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
              style={{ cursor: 'pointer' }}
            >
              <img src={item.image} alt={item.name} />
              {item.badge && <span className="related-badge">{item.badge}</span>}
            </div>
            
            <div className="related-info">
              <span className="related-item-cat">{item.category}</span>
              <h4 
                className="related-item-name" 
                onClick={() => handleProductClick(item)}
                style={{ cursor: 'pointer' }}
              >
                {item.name}
              </h4>
              <div className="related-price-row">
                <span className="related-price">
                  ₹{item.price.toLocaleString("en-IN")}
                </span>
                <button 
                  className="related-add-btn" 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents navigation when clicking add
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