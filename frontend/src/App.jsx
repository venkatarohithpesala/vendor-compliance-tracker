import { useState, useEffect } from "react";
import API from "./api/api";
import Login from "./pages/Login";
import ProtectedPage from "./pages/ProtectedPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status from backend
    API.get("/auth/check")
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? (
    <ProtectedPage setIsAuthenticated={setIsAuthenticated} />
  ) : (
    <Login setIsAuthenticated={setIsAuthenticated} />
  );
}

export default App;
