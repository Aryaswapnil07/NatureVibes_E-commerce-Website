import React, { useRef, useEffect, useState } from 'react';

const ProductCard = ({ product, onAdd }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <div ref={cardRef} className={`product-card category-card ${isVisible ? 'show' : ''}`}>
      {product.badge && <div className="badge">{product.badge}</div>}
      <div className="product-img-box">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-info">
        <span className="product-cat">{product.category}</span>
        <h4 className="product-title">{product.name}</h4>
        <div className="price-action-row">
          <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
          <button className="add-btn-icon" onClick={() => onAdd(product)}>
            <span className="material-icons">add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);