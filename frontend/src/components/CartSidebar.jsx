import React from "react";
import { useNavigate } from "react-router-dom";

const CartSidebar = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemove,
  isLoggedIn,
  onRequireLogin,
}) => {
  const navigate = useNavigate();

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const groupedItems = cartItems.reduce((acc, item) => {
    const category = item.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (!isLoggedIn) {
      onClose();
      onRequireLogin?.();
      return;
    }

    onClose();
    navigate("/checkout");
  };

  return (
    <>
      <div className={`cart-overlay-bg ${isOpen ? "active" : ""}`} onClick={onClose} />
      <div className={`cart-sidebar ${isOpen ? "active" : ""}`}>
        <div className="cart-header-side">
          <h3>Your Garden Cart</h3>
          <span className="material-icons close-cart-btn" onClick={onClose}>
            close
          </span>
        </div>

        <div className="cart-body-side">
          {cartItems.length === 0 ? (
            <div className="empty-cart-container">
              <span className="material-icons empty-icon">eco</span>
              <p className="empty-msg">
                Your garden cart is empty.
                <br />
                Add some plants to bring it to life!
              </p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="cart-category-group">
                <div className="cart-cat-title">{category}</div>
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">
                        {`\u20B9${item.price.toLocaleString("en-IN")}`}
                      </div>
                    </div>
                    <div className="cart-controls">
                      <button className="qty-btn" onClick={() => onUpdateQty(item.id, -1)}>
                        -
                      </button>
                      <div className="qty-display">{item.quantity}</div>
                      <button className="qty-btn" onClick={() => onUpdateQty(item.id, 1)}>
                        +
                      </button>
                    </div>
                    <span className="material-icons remove-btn" onClick={() => onRemove(item.id)}>
                      delete_outline
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="cart-footer-side">
          <div className="cart-subtotal">
            <span>Subtotal</span>
            <span>{`\u20B9${total.toLocaleString("en-IN")}`}</span>
          </div>

          <button
            className={`checkout-btn ${cartItems.length === 0 ? "disabled" : ""}`}
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            {isLoggedIn ? "Proceed to Checkout" : "Login to Checkout"}
          </button>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
