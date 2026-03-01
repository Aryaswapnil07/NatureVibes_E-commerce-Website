import React, { useEffect, useState } from 'react';

const StickyCartBar = ({ cartItems, onOpenCart }) => {
  const [bump, setBump] = useState(false);
  
  const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Trigger animation when totalQty changes
  useEffect(() => {
    if (totalQty === 0) return;
    setBump(true);
    const timer = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(timer);
  }, [totalQty]);

  if (totalQty === 0) return null;

  return (
    <div id="sticky-cart-bar" className={`visible ${bump ? 'bump' : ''}`}>
      <div className="cart-info">
        <span className="cart-count-text">{totalQty} ITEM{totalQty !== 1 ? 'S' : ''}</span>
        <span className="cart-total-price">₹{totalPrice.toLocaleString('en-IN')}</span>
      </div>
      <div className="view-cart-link" onClick={onOpenCart} style={{cursor:'pointer'}}>
        View Cart <span className="material-icons" style={{fontSize: '1rem'}}>arrow_forward</span>
      </div>
    </div>
  );
};

export default StickyCartBar;