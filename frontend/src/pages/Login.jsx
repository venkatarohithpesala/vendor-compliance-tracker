import { useState } from "react";
import API from "../api/api";
import { FaLock, FaEnvelope, FaTimes } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { showToast } from '../utils/toast';

function Login({ setIsAuthenticated, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactLoading, setContactLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/login", { email, password, rememberMe });
      window.location.href = '/home';
    } catch (err) {
      if (!navigator.onLine) {
        showToast.error('Please check your internet connection');
      } else if (err.code === 'ERR_NETWORK') {
        showToast.error('Unable to connect to the server. Please make sure the server is running.');
      } else if (err.response?.status === 401) {
        showToast.error('Invalid email or password');
      } else if (err.response?.status === 404) {
        showToast.error('User not found');
      } else if (err.response?.status === 403) {
        showToast.error('Account is locked. Please contact administrator');
      } else if (err.response?.data?.message) {
        showToast.error(err.response.data.message);
      } else {
        showToast.error('An unexpected error occurred. Please try again later.');
      }
    }
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      showToast.error("Please fill in all fields.");
      return;
    }
    setContactLoading(true);
    try {
      await API.post("/access-requests", {
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        message: contactForm.message.trim(),
      });
      showToast.success("Your request has been sent. An administrator will get back to you shortly.");
      setContactForm({ name: "", email: "", message: "" });
      setShowContactModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send your request. Please try again.";
      showToast.error(msg);
    } finally {
      setContactLoading(false);
    }
  };

  const inputStyle = {
    borderColor: "var(--color-border)",
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text)",
    fontFamily: "var(--font-logo)",
    '--tw-ring-color': 'var(--color-primary)',
  };

  return (
    <>
      {/* ── Page ── */}
      <div
        className="flex items-center justify-center min-h-screen px-6 py-10"
        style={{
          background:
            "linear-gradient(135deg, #e8ede4 0%, #f4f7f0 40%, #edf2e8 70%, #dce6d8 100%)",
        }}
      >
        <div className="w-full max-w-[460px]">
          <form
            onSubmit={handleLogin}
            className="rounded-2xl p-8 space-y-6"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 24px 60px rgba(60, 80, 55, 0.12)",
              fontFamily: "var(--font-logo)",
            }}
          >
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <div
                className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: "#8c9b82" }}
              >
                <span
                  className="text-white text-[11px] tracking-[0.18em] uppercase"
                  style={{ fontFamily: "var(--font-logo)" }}
                >
                  Ventrack
                </span>
              </div>
              <h1
                className="text-[28px] font-semibold leading-tight tracking-tight"
                style={{ color: "var(--color-text)" }}
              >
                Vendor Compliance Portal
              </h1>
              <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
                Sign in to manage and track your vendors
              </p>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: "var(--color-text)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border focus:ring-2 focus:border-transparent outline-none transition-all"
                    style={inputStyle}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: "var(--color-text)" }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3.5 rounded-xl border focus:ring-2 focus:border-transparent outline-none transition-all"
                    style={inputStyle}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                    style={{ color: "var(--color-muted)" }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border focus:ring-2 focus:ring-offset-0 appearance-none bg-center bg-no-repeat bg-[length:10px_10px]"
                  style={{
                    borderColor: rememberMe ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: rememberMe ? 'var(--color-primary)' : 'var(--color-surface)',
                    backgroundImage: rememberMe
                      ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='white' d='M6.173 12.252 2.22 8.299l1.414-1.414 2.54 2.54 6.19-6.19 1.414 1.414z'/%3E%3C/svg%3E\")"
                      : 'none',
                    '--tw-ring-color': 'var(--color-primary)',
                  }}
                />
                <label style={{ color: "var(--color-muted)" }}>Remember me for 7 days</label>
              </div>
              <a
                href="#"
                className="font-medium transition-colors"
                style={{ color: 'var(--color-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-primary)"; }}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full text-white rounded-xl px-6 py-3.5 font-semibold transition-all duration-200"
              style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-logo)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
            >
              Sign in
            </button>

            {/* Contact */}
            <div className="text-center text-sm" style={{ color: "var(--color-muted)" }}>
              Don't have an account?{" "}
              <button
                type="button"
                className="font-medium transition-colors bg-transparent border-none p-0 cursor-pointer"
                style={{ color: 'var(--color-primary)', fontFamily: "var(--font-logo)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-primary)"; }}
                onClick={() => setShowContactModal(true)}
              >
                Request access
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Contact Modal ── */}
      {showContactModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(31, 41, 55, 0.45)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowContactModal(false); }}
        >
          <div
            className="w-full max-w-[460px] rounded-2xl p-8"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 24px 60px rgba(60, 80, 55, 0.16)",
              fontFamily: "var(--font-logo)",
            }}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                  Request Access
                </h2>
                <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
                  Fill in the details below and an administrator will get back to you.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="ml-4 p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--color-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-page-bg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                aria-label="Close"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: "var(--color-text)" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:border-transparent outline-none transition-all"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: "var(--color-text)" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:border-transparent outline-none transition-all"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: "var(--color-text)" }}>
                  Message
                </label>
                <textarea
                  name="message"
                  placeholder="Briefly describe why you need access..."
                  value={contactForm.message}
                  onChange={handleContactChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:border-transparent outline-none transition-all resize-none"
                  style={inputStyle}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"
                  style={{
                    border: "1px solid var(--color-border)",
                    color: "var(--color-muted)",
                    backgroundColor: "transparent",
                    fontFamily: "var(--font-logo)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-page-bg)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="flex-1 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-logo)" }}
                  onMouseEnter={(e) => { if (!contactLoading) e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
                >
                  {contactLoading ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;
