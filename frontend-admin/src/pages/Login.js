import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const ADMIN_EMAILS = [
  '230103148@sdu.edu.kz',
  '230103256@sdu.edu.kz',
  '230103126@sdu.edu.kz',
  '230103220@sdu.edu.kz',
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!ADMIN_EMAILS.includes(email)) {
      setError('Access denied. This panel is for administrators only.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message === 'Not an admin account' ? 'Access denied.' : (err.response?.data?.detail || 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg"></div>
      <div className="login-card fade-up">
        <div className="login-header">
          <div className="login-logo">☕</div>
          <h1>SmartBreak</h1>
          <p>Administrator Access</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label>Admin Email</label>
            <input
              type="email"
              placeholder="your@sdu.edu.kz"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>
        <div className="login-hint">
          <p>Default passwords: Admin@1 through Admin@4</p>
          <p>Change via the backend after first login.</p>
        </div>
      </div>
    </div>
  );
}
