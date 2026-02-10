import React from 'react';
import ProductCard from './ProductCard';

const ProductSection = ({ title, id, products, onAddToCart }) => {
  return (
    <>
      <div id={id} className="section-title-wrap">
        <h3>{title}</h3>
      </div>
      <div className="grid-container">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAdd={onAddToCart} />
        ))}
      </div>
    </>
  );
};

export default React.memo(ProductSection);