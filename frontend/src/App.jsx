import { useState } from "react";
import Login from "./pages/Login";
import ProtectedPage from "./pages/ProtectedPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  return isAuthenticated ? (
    <ProtectedPage setIsAuthenticated={setIsAuthenticated} />
  ) : (
    <Login setIsAuthenticated={setIsAuthenticated} />
  );
}

export default App;
