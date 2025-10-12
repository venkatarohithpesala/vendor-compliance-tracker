import { useState } from "react";
import API from "../api/api";
import { FaLock, FaEnvelope, FaUserLock } from 'react-icons/fa';

function Login({ setIsAuthenticated, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      setIsAuthenticated(true);
      setUser(res.data.user);
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600">
      <div className="relative w-full max-w-md px-6 pt-16">
        {/* Logo or Icon could go here */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
            <FaUserLock className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 pt-20 space-y-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
            <p className="text-gray-600 text-sm mt-2">Please sign in to your account</p>
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded" />
              <label className="ml-2 text-gray-600">Remember me</label>
            </div>
            <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">Forgot password?</a>
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-4 py-3 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Sign in
          </button>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            Not registered yet?{" "}
            <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">
              Contact administrator
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
