import { useState } from "react";
import API from "../api/api";
import { FaLock, FaEnvelope, FaUserLock } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { showToast } from '../utils/toast';

function Login({ setIsAuthenticated, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      await API.post("/auth/login", { email, password, rememberMe });
      
      // Redirect to home - App.jsx will check authentication and update state
      window.location.href = '/home';
    } catch (err) {
      
      // Handle different types of errors
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

  return (
    <div
      className="flex items-center justify-center min-h-screen px-6"
      style={{
        backgroundColor: "var(--color-page-bg)",
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(var(--color-primary-rgb), 0.08), transparent 32%), radial-gradient(circle at 80% 80%, rgba(var(--color-primary-rgb), 0.06), transparent 30%)"
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div
            className="h-11 w-11 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(var(--color-primary-rgb), 0.12)" }}
          >
            <FaUserLock className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>Sign in</h1>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>Use your company account to continue</p>
          </div>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl shadow-sm p-8 space-y-6"
          style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: "var(--color-text)" }}>Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:border-transparent outline-none transition-all"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text)",
                    '--tw-ring-color': 'var(--color-primary)'
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: "var(--color-text)" }}>Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border focus:ring-2 focus:border-transparent outline-none transition-all"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text)",
                    '--tw-ring-color': 'var(--color-primary)'
                  }}
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

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
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
                  '--tw-ring-color': 'var(--color-primary)'
                }}
              />
              <label className="ml-2" style={{ color: "var(--color-muted)" }}>Remember me for 7 days</label>
            </div>
             <a href="#" className="font-medium transition-colors text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">Forgot password?</a>
          </div>
          
          <button
            type="submit"
            className="w-full text-white rounded-xl px-6 py-3.5 font-semibold transition-all duration-200"
            style={{ backgroundColor: "var(--color-primary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
          >
            Sign in
          </button>
          
          <div className="text-center text-sm mt-4" style={{ color: "var(--color-muted)" }}>
            Not registered yet?{" "}
           <a href="#" className="font-medium transition-colors text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
              Contact administrator
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
