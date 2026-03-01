import React, { useMemo, useState } from "react";
import API_BASE_URL from "../config/api";

const LoginModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const endpoint = useMemo(
    () => (isLoginView ? "/api/users/login" : "/api/users/register"),
    [isLoginView]
  );

  if (!isOpen) return null;

  const toggleView = () => {
    setIsLoginView((prev) => !prev);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = isLoginView
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || "Authentication failed");
      }

      onAuthSuccess?.(data.token);
      setForm({ name: "", email: "", password: "" });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: "flex" }} onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <span className="close-modal" onClick={onClose}>
          &times;
        </span>

        <h2>{isLoginView ? "Welcome Back" : "Create Account"}</h2>
        <p className="modal-subtitle">
          {isLoginView ? "Login to access your garden" : "Join our community of plant lovers"}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLoginView ? (
            <input
              name="name"
              type="text"
              className="modal-input"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          ) : null}

          <input
            name="email"
            type="email"
            className="modal-input"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            className="modal-input"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error ? (
            <p
              style={{
                marginTop: "8px",
                color: "#842029",
                background: "#fff5f5",
                border: "1px solid #f5c2c7",
                borderRadius: "8px",
                padding: "8px 10px",
                fontSize: "13px",
              }}
            >
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn-login-submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isLoginView
              ? "Log In"
              : "Sign Up"}
          </button>
        </form>

        <div className="modal-divider">or</div>

        <button className="google-btn" type="button" disabled>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google Logo"
            style={{ width: "20px", height: "20px" }}
          />
          {isLoginView ? "Sign in with Google" : "Sign up with Google"}
        </button>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px" }}>
          {isLoginView ? (
            <p>
              New to NatureVibes?{" "}
              <span
                onClick={toggleView}
                style={{ color: "var(--green, #28a745)", cursor: "pointer", fontWeight: "bold" }}
              >
                Create an account
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span
                onClick={toggleView}
                style={{ color: "var(--green, #28a745)", cursor: "pointer", fontWeight: "bold" }}
              >
                Log In
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
