import React from 'react';

const CartSidebar = ({ isOpen, onClose, cartItems, onUpdateQty, onRemove }) => {
  // Calculate Subtotal
  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Group by category
  const groupedItems = cartItems.reduce((acc, item) => {
    const cat = item.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <>
      <div className={`cart-overlay-bg ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <div className={`cart-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="cart-header-side">
          <h3>Your Garden Cart</h3>
          <span className="material-icons close-cart-btn" onClick={onClose}>close</span>
        </div>
        
        <div className="cart-body-side">
          {cartItems.length === 0 ? (
            <p className="empty-msg">Your garden cart is empty.<br/>Add some plants to bring it to life!</p>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="cart-category-group">
                <div className="cart-cat-title">{category}</div>
                {items.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="cart-controls">
                      <button className="qty-btn" onClick={() => onUpdateQty(item.id, -1)}>-</button>
                      <div className="qty-display">{item.quantity}</div>
                      <button className="qty-btn" onClick={() => onUpdateQty(item.id, 1)}>+</button>
                    </div>
                    <span className="material-icons remove-btn" onClick={() => onRemove(item.id)}>delete_outline</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="cart-footer-side">
          <div className="cart-subtotal">
            <span>Subtotal</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <button className="checkout-btn">Proceed to Checkout</button>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;