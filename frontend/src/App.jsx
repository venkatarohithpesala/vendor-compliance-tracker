import { useState, useEffect } from "react";
import API from "./api/api";
import Login from "./pages/Login";
import ProtectedPage from "./pages/ProtectedPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status from backend
    API.get("/auth/check")
      .then((res) => {
        setIsAuthenticated(true);
        setUser(res.data.user);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? (
    <ProtectedPage user={user} setIsAuthenticated={setIsAuthenticated} />
  ) : (
    <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
  );
}

export default App;
