import { useState } from "react";
import API from "../api/api";
import { FaLock, FaEnvelope, FaUserLock } from 'react-icons/fa';
import { showToast } from '../utils/toast';

function Login({ setIsAuthenticated, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const res = await API.post("/auth/login", { email, password });
      setIsAuthenticated(true);
      setUser(res.data.user);
      showToast.success('Successfully logged in!');
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
    <div className="flex items-center justify-center min-h-screen" style={{ background: `linear-gradient(135deg, #faedcd 0%, #d4a373 100%)` }}>
      <div className="relative w-full max-w-md px-6 pt-16">
        {/* Logo or Icon could go here */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
            <FaUserLock className="h-12 w-12" style={{ color: '#5e0b15' }} />
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 pt-20 space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#90323d] to-[#5e0b15] bg-clip-text text-transparent">WELCOME BACK!</h1>
            <p className="text-gray-600 text-sm mt-3">Please sign in to your account</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent outline-none transition-all"
                  style={{ '--tw-ring-color': '#5e0b15' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent outline-none transition-all"
                  style={{ '--tw-ring-color': '#5e0b15' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 border-gray-300 rounded" style={{ color: '#d4a373', '--tw-ring-color': '#d4a373' }} />
              <label className="ml-2 text-gray-600">Remember me</label>
            </div>
             <a href="#" className="font-medium transition-colors" style={{ color: '#90323d', ':hover': { color: '#5e0b15' } }}>Forgot password?</a>
          </div>
          
          <button
            type="submit"
            className="w-full text-white rounded-xl px-6 py-3.5 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group"
            style={{ 
              background: `linear-gradient(45deg, #90323d, #5e0b15)`,
              textShadow: '0 1px 1px rgba(0,0,0,0.2)'
            }}
          >
            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            Sign in
          </button>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            Not registered yet?{" "}
           <a href="#" className="font-medium transition-colors" style={{ color: '#90323d', ':hover': { color: '#ba8a5c' } }}>
              Contact administrator
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
