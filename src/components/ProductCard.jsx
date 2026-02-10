import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate

const ProductCard = ({ product, onAdd }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate(); // ✅ Initialize navigation

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

  // ✅ Helper function to handle navigation
  const handleViewDetails = () => {
    // We pass the product object in 'state' so the Info Page has all the data immediately
    navigate(`/product/${product.id}`, { state: { product } });
    window.scrollTo(0, 0); // Ensure the new page starts at the top
  };

  return (
    <div ref={cardRef} className={`product-card category-card ${isVisible ? 'show' : ''}`}>
      {product.badge && <div className="badge">{product.badge}</div>}
      
      {/* ✅ Wrap Image in a clickable div */}
      <div className="product-img-box" onClick={handleViewDetails} style={{ cursor: 'pointer' }}>
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-info">
        <span className="product-cat">{product.category}</span>
        
        {/* ✅ Make Title clickable */}
        <h4 className="product-title" onClick={handleViewDetails} style={{ cursor: 'pointer' }}>
          {product.name}
        </h4>

        <div className="price-action-row">
          <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
          <button 
            className="add-btn-icon" 
            onClick={(e) => {
              e.stopPropagation(); // ✅ Prevents navigation when clicking 'Add'
              onAdd(product);
            }}
          >
            <span className="material-icons">add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);