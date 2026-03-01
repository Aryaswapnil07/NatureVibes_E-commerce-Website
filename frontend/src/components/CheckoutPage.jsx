import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Truck, CreditCard, ShieldCheck, ShoppingBag } from "lucide-react";
import API_BASE_URL from "../config/api";
import "../components/css/CheckoutPage.css";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;
const paymentOptions = [
  { value: "cod", label: "Cash on Delivery (COD)" },
  { value: "stripe", label: "Card / UPI via Stripe" },
];

const readApiResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = await response.json();
    return { payload, rawText: "" };
  }

  const rawText = await response.text();
  return { payload: null, rawText };
};

const CheckoutPage = ({ cartItems, totalAmount, clearCart, userToken }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    pincode: "",
    city: "Patna",
    state: "Bihar",
    streetAddress: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("payment") === "cancelled") {
      setError("Payment was cancelled. You can retry checkout.");
    }
  }, [location.search]);

  const handleInputChange = (event) => {
    setAddress((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const buildOrderPayload = () => ({
    items: cartItems.map((item) => {
      const normalizedItem = {
        name: item.name,
        image: item.image || "",
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
      };

      const sourceId = item.backendId || item.id;
      if (sourceId && objectIdRegex.test(String(sourceId))) {
        normalizedItem.productId = String(sourceId);
      }

      return normalizedItem;
    }),
    amount: Number(totalAmount || 0),
    address: {
      fullName: address.fullName,
      phone: address.phone,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    },
    customer: {
      name: address.fullName,
      email: address.email,
      phone: address.phone,
    },
  });

  const handlePlaceOrder = async () => {
    if (!address.fullName || !address.phone || !address.streetAddress || !address.email) {
      setError("Please fill all required delivery details.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setError("");
    setIsPlacing(true);

    try {
      const payload = buildOrderPayload();

      if (paymentMethod === "stripe") {
        const response = await fetch(
          `${API_BASE_URL}/api/orders/stripe/create-checkout-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(userToken ? { token: userToken } : {}),
            },
            body: JSON.stringify(payload),
          }
        );
        const { payload: data, rawText } = await readApiResponse(response);

        if (!response.ok || !data?.success) {
          if (!data && rawText.includes("Cannot POST")) {
            throw new Error(
              "Stripe API route not found. Restart backend and verify /api/orders/stripe/create-checkout-session is available."
            );
          }

          throw new Error(data?.message || "Unable to start Stripe checkout");
        }

        if (!data.checkoutUrl) {
          throw new Error("Stripe checkout URL is missing");
        }

        window.location.href = data.checkoutUrl;
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/orders/place`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userToken ? { token: userToken } : {}),
        },
        body: JSON.stringify({
          ...payload,
          paymentMethod: "cod",
          paymentStatus: "pending",
        }),
      });
      const { payload: data } = await readApiResponse(response);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to place order");
      }

      clearCart?.();
      navigate("/success", { state: { order: data.order } });
    } catch (placeError) {
      setError(placeError.message || "Unable to place order");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="nature-checkout-section">
      <div className="checkout-main-container">
        <div className="address-form-box">
          <h2 className="checkout-title">
            <Truck size={28} className="icon-green" /> Delivery Details
          </h2>
          <p className="checkout-subtitle">Where should we send your new plants?</p>

          <div className="address-input-grid">
            <div className="input-group full-width">
              <label>Full Name *</label>
              <input
                name="fullName"
                type="text"
                placeholder="Enter your name"
                value={address.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Email *</label>
              <input
                name="email"
                type="email"
                placeholder="name@email.com"
                value={address.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Phone Number *</label>
              <input
                name="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={address.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Pincode</label>
              <input
                name="pincode"
                type="text"
                placeholder="6-digit code"
                value={address.pincode}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group full-width">
              <label>Street Address *</label>
              <input
                name="streetAddress"
                type="text"
                placeholder="House No, Building, Area"
                value={address.streetAddress}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>City</label>
              <input
                name="city"
                type="text"
                value={address.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label>State</label>
              <input
                name="state"
                type="text"
                value={address.state}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="checkout-summary-box">
          <h3 className="summary-title">
            <ShoppingBag size={20} /> Order Summary
          </h3>

          <div className="checkout-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-item-mini">
                <img src={item.image} alt={item.name} />
                <div className="mini-info">
                  <span className="mini-name">{item.name}</span>
                  <span className="mini-qty">Qty: {item.quantity}</span>
                </div>
                <span className="mini-price">Rs {item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="summary-pricing">
            <div className="price-row">
              <span>Subtotal</span>
              <span>Rs {totalAmount}</span>
            </div>
            <div className="price-row">
              <span>Shipping</span>
              <span className="text-green">FREE</span>
            </div>
            <div className="price-row total-final">
              <span>Total Payable</span>
              <span>Rs {totalAmount}</span>
            </div>
          </div>

          <div className="payment-methods">
            <p className="payment-method-title">Payment Method</p>
            {paymentOptions.map((option) => (
              <label key={option.value} className="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          {error ? (
            <p
              style={{
                marginBottom: "12px",
                color: "#842029",
                background: "#fff5f5",
                border: "1px solid #f5c2c7",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          ) : null}

          <button className="confirm-pay-btn" onClick={handlePlaceOrder} disabled={isPlacing}>
            <CreditCard size={20} />{" "}
            {isPlacing
              ? paymentMethod === "stripe"
                ? "Redirecting to Stripe..."
                : "Placing Order..."
              : paymentMethod === "stripe"
              ? "Pay Securely with Stripe"
              : "Place Order (COD)"}
          </button>

          <div className="secure-badge">
            <ShieldCheck size={16} />
            <span>Your delivery details are securely handled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
