import { useEffect, useState } from "react";
import API from "../api/api";

function ProtectedPage({ setIsAuthenticated }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/test");
        setMessage(res.data.message);
      } catch (err) {
        setIsAuthenticated(false); // force logout if token invalid
      }
    };
    fetchData();
  }, [setIsAuthenticated]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <h1 className="text-3xl font-bold text-green-700">{message}</h1>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}

export default ProtectedPage;
