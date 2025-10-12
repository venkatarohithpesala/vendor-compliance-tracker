import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import API from "./api/api";
import Login from "./pages/Login";
import ProtectedPage from "./pages/ProtectedPage";

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);   // Initialize authentication state as false
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);  // Start with loading false since we don't have a token

    useEffect(() => {
    // Only check authentication if we think we might be authenticated
    if (document.cookie.includes('token')) {
      API.get("/auth/check")
        .then((res) => {
          if (res.data.authenticated) {
            setIsAuthenticated(true);
            setUser(res.data.user);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        })
        .catch(() => {
          setIsAuthenticated(false);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // If no token exists, immediately set loading to false
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
            )
          }
        />
        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <ProtectedPage user={user} setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
