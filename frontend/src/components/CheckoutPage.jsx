import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiTruck,
  FiShoppingBag,
  FiCreditCard,
  FiShield,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiHome,
  FiMap,
  FiDollarSign,
  FiCheckCircle,
} from "react-icons/fi";
import API_BASE_URL from "../config/api";
import "../components/css/CheckoutPage.css";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;
const paymentOptions = [
  { value: "cod", label: "Cash on Delivery (COD)", icon: FiDollarSign },
  { value: "stripe", label: "Card / UPI via Stripe", icon: FiCreditCard },
];
const EMPTY_ADDRESSES = [];

const normalizeText = (value) => String(value || "").trim();
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const resolveCartItemProductId = (item = {}) => {
  const candidateIds = [
    item.backendId,
    item.productId,
    item._id,
    item.product?._id,
    item.product?.id,
    item.id,
  ];

  for (const candidate of candidateIds) {
    const normalized = normalizeText(candidate);
    if (objectIdRegex.test(normalized)) {
      return normalized;
    }
  }

  return "";
};

const resolveCartItemQuantity = (item = {}) => {
  const quantity = Number(item.quantity ?? item.qty ?? item.count ?? 1);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : Number.NaN;
};

const resolveCartItemPrice = (item = {}) => {
  const price = Number(item.price ?? item.unitPrice ?? item.discountedPrice ?? 0);
  return Number.isFinite(price) && price > 0 ? price : Number.NaN;
};

const buildOrderItem = (item = {}) => {
  const productId = resolveCartItemProductId(item);
  const quantity = resolveCartItemQuantity(item);
  const price = resolveCartItemPrice(item);
  const name = normalizeText(
    item.baseName || item.productBaseName || item.name || item.title || item.product?.name
  );
  const variantSize = normalizeText(item.variantSize || item.size || item.variant?.size);
  const image = normalizeText(item.image || item.thumbnail || item.product?.image);

  const hasValidQuantity = Number.isInteger(quantity) && quantity > 0;
  const hasLegacySnapshot = Boolean(name) && Number.isFinite(price) && hasValidQuantity;
  const hasCanonicalProductId = Boolean(productId) && hasValidQuantity;

  if (!hasCanonicalProductId && !hasLegacySnapshot) {
    return null;
  }

  return {
    ...(productId ? { productId, backendId: productId, id: productId } : {}),
    ...(name ? { name } : {}),
    ...(Number.isFinite(price) ? { price } : {}),
    ...(variantSize ? { variantSize } : {}),
    ...(image ? { image } : {}),
    quantity,
  };
};

const readApiResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = await response.json();
    return { payload, rawText: "" };
  }

  const rawText = await response.text();
  return { payload: null, rawText };
};

const getDefaultSavedAddress = (addresses = []) =>
  Array.isArray(addresses)
    ? addresses.find((entry) => entry?.isDefault) || addresses[0] || null
    : null;

const buildAddressState = ({ userProfile = null, selectedAddress = null } = {}) => ({
  fullName: normalizeText(selectedAddress?.fullName || userProfile?.name),
  email: normalizeText(userProfile?.email),
  phone: normalizeText(selectedAddress?.phone || userProfile?.phone),
  pincode: normalizeText(selectedAddress?.pincode),
  city: normalizeText(selectedAddress?.city),
  state: normalizeText(selectedAddress?.state),
  streetAddress: normalizeText(selectedAddress?.streetAddress),
});

const CheckoutPage = ({
  cartItems,
  totalAmount,
  clearCart,
  userProfile,
  userToken,
  onRequireLogin,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    streetAddress: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const isAuthenticated = Boolean(userToken);
  const savedAddresses = Array.isArray(userProfile?.addresses)
    ? userProfile.addresses
    : EMPTY_ADDRESSES;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!userProfile) {
      return;
    }

    const defaultSavedAddress = getDefaultSavedAddress(savedAddresses);
    setSelectedAddressId(defaultSavedAddress?._id ? String(defaultSavedAddress._id) : "");
    setAddress(buildAddressState({ userProfile, selectedAddress: defaultSavedAddress }));
  }, [savedAddresses, userProfile]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cancelledOrderId = normalizeText(searchParams.get("orderId"));

    if (searchParams.get("payment") !== "cancelled") {
      return;
    }

    let isMounted = true;

    const cancelPendingStripeCheckout = async () => {
      if (!cancelledOrderId || !objectIdRegex.test(cancelledOrderId)) {
        if (isMounted) {
          setError("Payment was cancelled. You can retry checkout.");
        }
        return;
      }

      if (!userToken) {
        if (isMounted) {
          setError("Payment was cancelled. Please login again before retrying checkout.");
          onRequireLogin?.();
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/stripe/cancel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: userToken,
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ orderId: cancelledOrderId }),
        });
        const { payload, rawText } = await readApiResponse(response);

        if (!response.ok || !payload?.success) {
          if (response.status === 401) {
            onRequireLogin?.();
          }

          throw new Error(
            payload?.message || rawText || "Payment was cancelled. Please try checkout again."
          );
        }

        if (isMounted) {
          setError("Payment was cancelled. Reserved stock was released and you can retry checkout.");
        }
      } catch (cancelError) {
        if (isMounted) {
          setError(cancelError.message || "Payment was cancelled. Please try checkout again.");
        }
      }
    };

    cancelPendingStripeCheckout();

    return () => {
      isMounted = false;
    };
  }, [location.search, onRequireLogin, userToken]);

  const handleInputChange = (event) => {
    if (selectedAddressId) {
      setSelectedAddressId("");
    }

    setAddress((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSavedAddressChange = (event) => {
    const nextAddressId = event.target.value;
    setSelectedAddressId(nextAddressId);

    if (!nextAddressId) {
      setAddress((prev) => ({
        ...prev,
        email: normalizeText(userProfile?.email || prev.email),
      }));
      return;
    }

    const matchedAddress = savedAddresses.find(
      (entry) => String(entry?._id || "") === String(nextAddressId)
    );

    if (matchedAddress) {
      setAddress(buildAddressState({ userProfile, selectedAddress: matchedAddress }));
    }
  };

  const buildOrderPayload = () => ({
    items: cartItems.map(buildOrderItem).filter(Boolean),
    amount: Number(totalAmount || 0),
    ...(selectedAddressId ? { addressId: selectedAddressId } : {}),
    address: {
      fullName: address.fullName,
      email: address.email,
      phone: address.phone,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    },
    customer: {
      email: address.email,
    },
  });

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setError("Please login to place your order.");
      onRequireLogin?.();
      return;
    }

    if (!address.fullName || !address.phone || !address.streetAddress || !address.email) {
      setError("Please fill all required delivery details.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const hasInvalidItems = cartItems.some((item) => !buildOrderItem(item));

    if (hasInvalidItems) {
      setError(
        "Some cart items are invalid or outdated. Please remove them and add the products again."
      );
      return;
    }

    setError("");
    setIsPlacing(true);

    try {
      const payload = buildOrderPayload();
      const headers = {
        "Content-Type": "application/json",
        token: userToken,
        Authorization: `Bearer ${userToken}`,
      };

      if (paymentMethod === "stripe") {
        const response = await fetch(
          `${API_BASE_URL}/api/orders/stripe/create-checkout-session`,
          {
            method: "POST",
            headers,
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

          if (response.status === 401) {
            onRequireLogin?.();
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
        headers,
        body: JSON.stringify({
          ...payload,
          paymentMethod: "cod",
          paymentStatus: "pending",
        }),
      });
      const { payload: data } = await readApiResponse(response);

      if (!response.ok || !data?.success) {
        if (response.status === 401) {
          onRequireLogin?.();
        }
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
            <FiTruck size={28} className="icon-green" /> Delivery Details
          </h2>
          <p className="checkout-subtitle">Where should we send your new plants?</p>

          {!isAuthenticated ? (
            <p
              style={{
                marginBottom: "12px",
                color: "#7a2e00",
                background: "#fff4e5",
                border: "1px solid #ffd8a8",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "14px",
              }}
            >
              You must be logged in to place an order.
            </p>
          ) : null}

          {savedAddresses.length ? (
            <>
              <div className="input-group full-width">
                <label className="label-with-icon">
                  <FiHome className="label-icon" /> Saved Address
                </label>
                <select value={selectedAddressId} onChange={handleSavedAddressChange}>
                  <option value="">Use a new address</option>
                  {savedAddresses.map((savedAddress) => (
                    <option key={savedAddress._id} value={savedAddress._id}>
                      {(savedAddress.label || "Address").trim() || "Address"}
                      {savedAddress.isDefault ? " (Default)" : ""}
                      {savedAddress.city ? ` - ${savedAddress.city}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <p className="saved-address-note">
                Selecting a saved address will autofill the form. Editing any field switches back
                to a custom address for this checkout.
              </p>
            </>
          ) : null}

          <div className="address-input-grid">
            <div className="input-group full-width">
              <label className="label-with-icon">
                <FiUser className="label-icon" /> Full Name *
              </label>
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
              <label className="label-with-icon">
                <FiMail className="label-icon" /> Email *
              </label>
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
              <label className="label-with-icon">
                <FiPhone className="label-icon" /> Phone Number *
              </label>
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
              <label className="label-with-icon">
                <FiMapPin className="label-icon" /> Pincode
              </label>
              <input
                name="pincode"
                type="text"
                placeholder="6-digit code"
                value={address.pincode}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group full-width">
              <label className="label-with-icon">
                <FiHome className="label-icon" /> Street Address *
              </label>
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
              <label className="label-with-icon">
                <FiMap className="label-icon" /> City
              </label>
              <input
                name="city"
                type="text"
                value={address.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label className="label-with-icon">
                <FiMapPin className="label-icon" /> State
              </label>
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
            <FiShoppingBag size={20} /> Order Summary
          </h3>

          <div className="checkout-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-item-mini">
                <img src={item.image} alt={item.name} />
                <div className="mini-info">
                  <span className="mini-name">{item.name}</span>
                  <span className="mini-qty">
                    Qty: {item.quantity}
                    {item.variantSize ? `, Size: ${item.variantSize}` : ""}
                  </span>
                </div>
                <span className="mini-price">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="summary-pricing">
            <div className="price-row">
              <span>Subtotal</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="price-row">
              <span>Shipping</span>
              <span className="text-green">FREE</span>
            </div>
            <div className="price-row total-final">
              <span>Total Payable</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="payment-methods">
            <p className="payment-method-title">Payment Method</p>
            {paymentOptions.map((option) => {
              const OptionIcon = option.icon;
              const isSelected = paymentMethod === option.value;
              return (
                <label
                  key={option.value}
                  className={`payment-method-option ${isSelected ? "selected" : ""}`}
                >
                  <span className="payment-option-start">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={isSelected}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                    />
                    <span className="payment-option-content">
                      <OptionIcon className="payment-option-icon" />
                      <span>{option.label}</span>
                    </span>
                  </span>
                  <FiCheckCircle
                    className={`payment-option-check ${isSelected ? "visible" : ""}`}
                  />
                </label>
              );
            })}
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

          <button
            className="confirm-pay-btn"
            onClick={handlePlaceOrder}
            disabled={isPlacing}
          >
            <FiCreditCard size={20} className="btn-icon" />{" "}
            {isPlacing
              ? paymentMethod === "stripe"
                ? "Redirecting to Stripe..."
                : "Placing Order..."
              : !isAuthenticated
              ? "Login Required to Place Order"
              : paymentMethod === "stripe"
              ? "Pay Securely with Stripe"
              : "Place Order (COD)"}
          </button>

          <div className="secure-badge">
            <FiShield size={16} />
            <span>Your delivery details are securely handled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
