import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import useAuthStore from "../store/authStore";
import "../styles/auth.css";

// MOCK FALLBACK
const MOCK_USERS = [
  {
    id: 1,
    name: "Aibek Dzhaksybekov",
    email: "student@sdu.edu.kz",
    role: "customer",
    password: "student123",
  },
  {
    id: 2,
    name: "Cafe Manager",
    email: "cafe@sdu.edu.kz",
    role: "cafe_staff",
    password: "cafe123",
  },
  {
    id: 3,
    name: "Delivery Guy",
    email: "delivery@sdu.edu.kz",
    role: "delivery_staff",
    password: "delivery123",
  },
];

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Enter a valid email";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    return newErrors;
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

    try {
      // Attempt real API call
      const res = await client.post("/users/login", form);
      const { user, token } = res.data;
      login(user, token);
      redirectByRole(user.role);
    } catch (err) {
      // MOCK FALLBACK: if API fails, try mock users
      console.warn("API unavailable, using mock login fallback");
      const mockUser = MOCK_USERS.find(
        (u) => u.email === form.email && u.password === form.password,
      );
      if (mockUser) {
        const { password, ...userWithoutPassword } = mockUser;
        login(userWithoutPassword, "mock-jwt-token-" + mockUser.id);
        redirectByRole(mockUser.role);
      } else {
        setApiError(
          "Invalid email or password. (Try: student@sdu.edu.kz / student123)",
        );
      }
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
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🍱</div>
          <h1 className="auth-title">SmartBreak</h1>
          <p className="auth-subtitle">SDU Food Ordering Platform</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h2 className="form-heading">Welcome back</h2>

          {apiError && (
            <div className="alert alert-error">
              <span>⚠️</span> {apiError}
            </div>
          )}

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
              autoComplete="email"
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

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
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Create one
          </Link>
        </div>

        {/* Demo credentials helper */}
        <div className="demo-hint">
          <p className="demo-hint-title">🔑 Demo Accounts</p>
          <p>student@sdu.edu.kz / student123</p>
          <p>cafe@sdu.edu.kz / cafe123</p>
          <p>delivery@sdu.edu.kz / delivery123</p>
        </div>
      </div>
    </div>
  );
}
