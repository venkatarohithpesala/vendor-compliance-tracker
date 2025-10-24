import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import API from "./api/api";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AddCompany from "./pages/companies/AddCompany";
import Layout from "./components/Layout";

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await API.get('/auth/check');
      setIsAuthenticated(true);
      setUser(response.data.user);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.warn('Auth check failed:', error);
      }
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
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
              <Login checkAuth={checkAuth} />
            )
          }
        />
        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <Home user={user} setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/companies/add"
          element={
            isAuthenticated ? (
              <Layout title="Add New Company">
                <AddCompany />
              </Layout>
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
