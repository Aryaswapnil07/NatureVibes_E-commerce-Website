import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

const formatDate = (isoDate) => {
  if (!isoDate) return "N/A";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const defaultAddressForm = {
  addressId: "",
  label: "Home",
  fullName: "",
  phone: "",
  streetAddress: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const UserProfile = ({
  userProfile,
  isLoading,
  isLoggedIn,
  userToken,
  onRefreshProfile,
  section = "profile",
  onOpenLogin,
  onLogout,
  autoLogout = false,
}) => {
  const navigate = useNavigate();
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });
  const [ordersData, setOrdersData] = useState({
    currentOrders: [],
    historyOrders: [],
  });
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(defaultAddressForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (autoLogout && isLoggedIn) {
      onLogout?.();
      navigate("/", { replace: true });
    }
  }, [autoLogout, isLoggedIn, onLogout, navigate]);

  useEffect(() => {
    setProfileForm({
      name: userProfile?.name || "",
      phone: userProfile?.phone || "",
    });
  }, [userProfile]);

  const fetchOrders = useCallback(async () => {
    if (!userToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/my`, {
        headers: { token: userToken },
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to load orders");
      }
      setOrdersData({
        currentOrders: payload.currentOrders || [],
        historyOrders: payload.historyOrders || [],
      });
    } catch (ordersError) {
      setError(ordersError.message);
    }
  }, [userToken]);

  const fetchAddresses = useCallback(async () => {
    if (!userToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/addresses`, {
        headers: { token: userToken },
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to load addresses");
      }
      setAddresses(payload.addresses || []);
    } catch (addressError) {
      setError(addressError.message);
    }
  }, [userToken]);

  useEffect(() => {
    setError("");
    setStatus("");

    if (section === "current-orders" || section === "order-history") {
      fetchOrders();
    }

    if (section === "addresses") {
      fetchAddresses();
    }
  }, [section, userToken, fetchOrders, fetchAddresses]);

  const initials = useMemo(
    () =>
      (userProfile?.name || "User")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [userProfile?.name]
  );

  if (!isLoggedIn) {
    return (
      <section className="profile-page">
        <div className="profile-shell">
          <div className="profile-hero-card">
            <h1>Your Account</h1>
            <p>Please login to view your profile, orders, and addresses.</p>
            <button className="profile-primary-btn" onClick={onOpenLogin}>
              Login to Continue
            </button>
          </div>
        </div>
      </section>
    );
  }

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          token: userToken,
        },
        body: JSON.stringify(profileForm),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to update profile");
      }

      setStatus("Profile updated successfully.");
      await onRefreshProfile?.();
    } catch (profileError) {
      setError(profileError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: userToken,
        },
        body: JSON.stringify(addressForm),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to save address");
      }

      setAddresses(payload.addresses || []);
      setAddressForm(defaultAddressForm);
      setStatus("Address saved successfully.");
    } catch (addressError) {
      setError(addressError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddressDelete = async (addressId) => {
    setSubmitting(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/address/${addressId}`, {
        method: "DELETE",
        headers: { token: userToken },
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to remove address");
      }

      setAddresses(payload.addresses || []);
      setStatus("Address removed.");
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderOrders = (orders) => {
    if (!orders.length) {
      return <p className="profile-status">No orders available in this section.</p>;
    }

    return (
      <div className="profile-orders-list">
        {orders.map((order) => (
          <article key={order._id} className="profile-order-card">
            <div className="profile-order-head">
              <h4>{order.orderNumber}</h4>
              <span className={`profile-order-status status-${order.status}`}>
                {order.status}
              </span>
            </div>
            <p>{formatDate(order.createdAt)}</p>
            <p>{order.items?.length || 0} item(s)</p>
            <strong>{formatCurrency(order.amount)}</strong>
          </article>
        ))}
      </div>
    );
  };

  return (
    <section className="profile-page">
      <div className="profile-shell">
        <div className="profile-hero-card">
          <span className="profile-kicker">User Account</span>
          <h1>Account Dashboard</h1>
          <p>Profile details, order tracking, and address management in one place.</p>
        </div>

        <div className="account-layout">
          <aside className="account-sidebar">
            <div className="profile-avatar-row">
              <div className="profile-avatar">{initials}</div>
              <div>
                <h2>{userProfile?.name || "User"}</h2>
                <p className="profile-email">{userProfile?.email || "Not available"}</p>
              </div>
            </div>

            <nav className="account-nav-list">
              <Link
                to="/account/profile"
                className={`account-nav-link ${section === "profile" ? "active" : ""}`}
              >
                My Profile
              </Link>
              <Link
                to="/account/orders/current"
                className={`account-nav-link ${
                  section === "current-orders" ? "active" : ""
                }`}
              >
                Current Orders
              </Link>
              <Link
                to="/account/orders/history"
                className={`account-nav-link ${
                  section === "order-history" ? "active" : ""
                }`}
              >
                Order History
              </Link>
              <Link
                to="/account/addresses"
                className={`account-nav-link ${section === "addresses" ? "active" : ""}`}
              >
                Address Book
              </Link>
              <button
                className="account-nav-link logout"
                onClick={() => {
                  onLogout?.();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </nav>
          </aside>

          <div className="account-content">
            {error ? <p className="account-alert error">{error}</p> : null}
            {status ? <p className="account-alert success">{status}</p> : null}

            {section === "profile" ? (
              <div className="profile-panel">
                <h3>Update Profile</h3>
                {isLoading ? (
                  <p className="profile-status">Loading profile details...</p>
                ) : (
                  <form className="account-form-grid" onSubmit={handleProfileSave}>
                    <label>
                      Full Name
                      <input
                        value={profileForm.name}
                        onChange={(event) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                    <label>
                      Phone Number
                      <input
                        value={profileForm.phone}
                        onChange={(event) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            phone: event.target.value,
                          }))
                        }
                        placeholder="10-digit number"
                      />
                    </label>
                    <label>
                      Email
                      <input value={userProfile?.email || ""} disabled />
                    </label>
                    <button type="submit" className="profile-primary-btn" disabled={submitting}>
                      {submitting ? "Saving..." : "Save Profile"}
                    </button>
                  </form>
                )}
              </div>
            ) : null}

            {section === "current-orders" ? (
              <div className="profile-panel">
                <h3>Current Orders</h3>
                {renderOrders(ordersData.currentOrders)}
              </div>
            ) : null}

            {section === "order-history" ? (
              <div className="profile-panel">
                <h3>Order History</h3>
                {renderOrders(ordersData.historyOrders)}
              </div>
            ) : null}

            {section === "addresses" ? (
              <div className="profile-panel">
                <h3>Address Book</h3>

                <form className="account-form-grid address-form" onSubmit={handleAddressSubmit}>
                  <label>
                    Label
                    <input
                      value={addressForm.label}
                      onChange={(event) =>
                        setAddressForm((prev) => ({ ...prev, label: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Full Name
                    <input
                      value={addressForm.fullName}
                      onChange={(event) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          fullName: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      value={addressForm.phone}
                      onChange={(event) =>
                        setAddressForm((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      required
                    />
                  </label>
                  <label>
                    Street Address
                    <input
                      value={addressForm.streetAddress}
                      onChange={(event) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          streetAddress: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label>
                    City
                    <input
                      value={addressForm.city}
                      onChange={(event) =>
                        setAddressForm((prev) => ({ ...prev, city: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    State
                    <input
                      value={addressForm.state}
                      onChange={(event) =>
                        setAddressForm((prev) => ({ ...prev, state: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Pincode
                    <input
                      value={addressForm.pincode}
                      onChange={(event) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          pincode: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(event) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          isDefault: event.target.checked,
                        }))
                      }
                    />
                    Set as default
                  </label>

                  <div className="address-actions">
                    <button type="submit" className="profile-primary-btn" disabled={submitting}>
                      {submitting
                        ? "Saving..."
                        : addressForm.addressId
                        ? "Update Address"
                        : "Add Address"}
                    </button>
                    {addressForm.addressId ? (
                      <button
                        type="button"
                        className="profile-secondary-btn"
                        onClick={() => setAddressForm(defaultAddressForm)}
                      >
                        Cancel Edit
                      </button>
                    ) : null}
                  </div>
                </form>

                <div className="saved-addresses">
                  {addresses.length ? (
                    addresses.map((address) => (
                      <article key={address._id} className="saved-address-card">
                        <div className="saved-address-head">
                          <h4>
                            {address.label}
                            {address.isDefault ? (
                              <span className="default-badge">Default</span>
                            ) : null}
                          </h4>
                        </div>
                        <p>{address.fullName}</p>
                        <p>{address.phone}</p>
                        <p>
                          {address.streetAddress}, {address.city}, {address.state}{" "}
                          {address.pincode}
                        </p>
                        <div className="saved-address-actions">
                          <button
                            onClick={() =>
                              setAddressForm({
                                addressId: address._id,
                                label: address.label || "Home",
                                fullName: address.fullName || "",
                                phone: address.phone || "",
                                streetAddress: address.streetAddress || "",
                                city: address.city || "",
                                state: address.state || "",
                                pincode: address.pincode || "",
                                isDefault: Boolean(address.isDefault),
                              })
                            }
                          >
                            Edit
                          </button>
                          <button onClick={() => handleAddressDelete(address._id)}>Delete</button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="profile-status">No saved addresses.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
