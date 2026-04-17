import React from 'react';

const StickyCartBar = ({ cartItems, onOpenCart }) => {
  const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const formattedTotalPrice = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(totalPrice);

  if (totalQty === 0) return null;

  return (
    <div id="sticky-cart-bar" key={totalQty} className="visible bump">
      <div className="cart-info">
        <span className="cart-count-text">{totalQty} ITEM{totalQty !== 1 ? 'S' : ''}</span>
        <span className="cart-total-price">Rs. {formattedTotalPrice}</span>
      </div>
      <div className="view-cart-link" onClick={onOpenCart} style={{ cursor: 'pointer' }}>
        View Cart <span className="material-icons" style={{ fontSize: '1rem' }}>arrow_forward</span>
      </div>
    </div>
  );
};

export default StickyCartBar;
