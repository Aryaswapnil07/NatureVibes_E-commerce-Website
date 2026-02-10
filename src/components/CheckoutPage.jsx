import React, { useState, useEffect } from "react";
import { Truck, CreditCard, ShieldCheck, ShoppingBag } from "lucide-react";
import "../components/css/CheckoutPage.css";

const CheckoutPage = ({ cartItems, totalAmount }) => {
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    city: "Patna", 
    state: "Bihar",
    streetAddress: "",
  });

  // Ensure page starts at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    // Basic Validation
    if (!address.fullName || !address.phone || !address.streetAddress) {
      alert("Please fill in all required delivery details.");
      return;
    }

    const res = await loadRazorpay();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // ⚠️ Replace with your actual Razorpay Key ID
      amount: totalAmount * 100, // Amount in paisa
      currency: "INR",
      name: "Nature Vibes",
      description: `Purchase of ${cartItems.length} items`,
      image: "https://your-logo-url.com/logo.png", // Replace with your actual logo
      handler: function (response) {
        alert(`Payment Successful! \nPayment ID: ${response.razorpay_payment_id}`);
        // Log transaction or redirect to a 'Success' page here
      },
      prefill: {
        name: address.fullName,
        contact: address.phone,
      },
      notes: {
        delivery_address: `${address.streetAddress}, ${address.city}, ${address.state} - ${address.pincode}`,
      },
      theme: {
        color: "#2e7d32", // Nature Vibes Green
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div className="nature-checkout-section">
      <div className="checkout-main-container">
        
        {/* LEFT: Address Form */}
        <div className="address-form-box">
          <h2 className="checkout-title">
            <Truck size={28} className="icon-green" /> Delivery Details
          </h2>
          <p className="checkout-subtitle">Where should we send your new plants?</p>
          
          <div className="address-input-grid">
            <div className="input-group full-width">
              <label>Full Name *</label>
              <input name="fullName" type="text" placeholder="Enter your name" onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Phone Number *</label>
              <input name="phone" type="tel" placeholder="10-digit mobile number" onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Pincode *</label>
              <input name="pincode" type="text" placeholder="6-digit code" onChange={handleInputChange} required />
            </div>
            <div className="input-group full-width">
              <label>Street Address *</label>
              <input name="streetAddress" type="text" placeholder="House No, Building, Area" onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>City</label>
              <input name="city" type="text" value={address.city} readOnly />
            </div>
            <div className="input-group">
              <label>State</label>
              <input name="state" type="text" value={address.state} readOnly />
            </div>
          </div>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="checkout-summary-box">
          <h3 className="summary-title"><ShoppingBag size={20} /> Order Summary</h3>
          
          <div className="checkout-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-item-mini">
                <img src={item.image} alt={item.name} />
                <div className="mini-info">
                  <span className="mini-name">{item.name}</span>
                  <span className="mini-qty">Qty: {item.quantity}</span>
                </div>
                <span className="mini-price">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="summary-pricing">
            <div className="price-row">
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="price-row">
              <span>Shipping</span>
              <span className="text-green">FREE</span>
            </div>
            <div className="price-row total-final">
              <span>Total Payable</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          <button className="confirm-pay-btn" onClick={handlePayment}>
            <CreditCard size={20} /> Pay Now via Razorpay
          </button>

          <div className="secure-badge">
            <ShieldCheck size={16} /> 
            <span>100% Secure SSL Encrypted Payment</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;