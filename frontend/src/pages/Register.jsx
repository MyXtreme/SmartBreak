import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import useAuthStore from "../store/authStore";
import "../styles/auth.css";

const ROLES = [
  {
    value: "customer",
    label: "🎓 Student / Teacher",
    description: "Browse menu & order food",
  },
  {
    value: "cafe_staff",
    label: "👨‍🍳 Cafe Staff",
    description: "Manage orders & menu",
  },
  {
    value: "delivery_staff",
    label: "🛵 Delivery Staff",
    description: "Handle deliveries",
  },
];

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "customer",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError("");

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    };

    try {
      const res = await client.post("/users/register", payload);
      const { user, token } = res.data;
      login(user, token);
      redirectByRole(user.role);
    } catch (err) {
      // MOCK FALLBACK
      console.warn("API unavailable, using mock register fallback");
      const mockUser = {
        id: Date.now(),
        name: form.name,
        email: form.email,
        role: form.role,
      };
      login(mockUser, "mock-jwt-token-" + mockUser.id);
      redirectByRole(form.role);
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === "cafe_staff") navigate("/cafe/dashboard");
    else if (role === "delivery_staff") navigate("/delivery/dashboard");
    else navigate("/menu");
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-header">
          <div className="auth-logo">🍱</div>
          <h1 className="auth-title">SmartBreak</h1>
          <p className="auth-subtitle">Create your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {apiError && (
            <div className="alert alert-error">
              <span>⚠️</span> {apiError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? "input-error" : ""}`}
              placeholder="Aibek Dzhaksybekov"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? "input-error" : ""}`}
              placeholder="you@sdu.edu.kz"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                type="password"
                id="confirm"
                name="confirm"
                className={`form-input ${errors.confirm ? "input-error" : ""}`}
                placeholder="••••••••"
                value={form.confirm}
                onChange={handleChange}
              />
              {errors.confirm && (
                <span className="field-error">{errors.confirm}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>I am a...</label>
            <div className="role-selector">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`role-card ${form.role === r.value ? "role-card--selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={form.role === r.value}
                    onChange={handleChange}
                  />
                  <span className="role-label">{r.label}</span>
                  <span className="role-desc">{r.description}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
