import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import API from "./api/api";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AddCompany from "./pages/companies/AddCompany";
import CompaniesList from "./pages/companies/CompaniesList";
import AdminsList from "./pages/admins/AdminsList";
import AddAdmin from "./pages/admins/AddAdmin";
import EditAdmin from "./pages/admins/EditAdmin";
import AcceptInvite from "./pages/admins/AcceptInvite";
import VendorsList from "./pages/vendors/VendorsList";
import AddVendor from "./pages/vendors/AddVendor";
import VendorProfile from "./pages/vendors/VendorProfile";
import VendorDocuments from "./pages/vendors/VendorDocuments";
import DocumentManagement from "./pages/documents/DocumentManagement";
import ExpiryTracking from "./pages/documents/ExpiryTracking";
import ComplianceRequirements from "./pages/compliance/ComplianceRequirements";
import AddComplianceRequirement from "./pages/compliance/AddComplianceRequirement";
import EditComplianceRequirement from "./pages/compliance/EditComplianceRequirement";
import ComplianceCategories from "./pages/compliance/ComplianceCategories";
import AddComplianceCategory from "./pages/compliance/AddComplianceCategory";
import EditComplianceCategory from "./pages/compliance/EditComplianceCategory";
import VendorComplianceAssignment from "./pages/compliance/VendorComplianceAssignment";
import ComplianceStatusDashboard from "./pages/compliance/ComplianceStatusDashboard";
import Layout from "./components/Layout";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await API.get("/auth/check");
      setIsAuthenticated(true);
      setUser(response.data.user);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.warn("Auth check failed:", error);
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
        autoClose={4000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
      />
      <Routes>
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <Login
                setIsAuthenticated={setIsAuthenticated}
                setUser={setUser}
              />
            )
          }
        />
        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <Layout
                title="Dashboard"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <Home user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/companies/add"
          element={
            isAuthenticated ? (
              <Layout
                title="Add New Company"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <AddCompany />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/companies"
          element={
            isAuthenticated ? (
              <Layout
                title="Companies"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <CompaniesList />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admins"
          element={
            isAuthenticated ? (
              <Layout
                title="Admins"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <AdminsList />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admins/add"
          element={
            isAuthenticated ? (
              <Layout
                title="Add Admin"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <AddAdmin />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admins/edit/:id"
          element={
            isAuthenticated ? (
              <Layout
                title="Edit Admin"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <EditAdmin />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/vendors"
          element={
            isAuthenticated ? (
              <Layout
                title="Vendors"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <VendorsList />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/vendors/add"
          element={
            isAuthenticated ? (
              <Layout
                title="Add Vendor"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <AddVendor user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/vendors/:id"
          element={
            isAuthenticated ? (
              <Layout
                title="Vendor Profile"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <VendorProfile user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/compliance/categories"
          element={
            isAuthenticated ? (
              <Layout
                title="Compliance Categories"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <ComplianceCategories />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/compliance/categories/add"
          element={
            isAuthenticated ? (
              <Layout
                title="Add Compliance Category"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <AddComplianceCategory />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/compliance/categories/edit/:id"
          element={
            isAuthenticated ? (
              <Layout
                title="Edit Compliance Category"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <EditComplianceCategory />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/compliance/requirements"
          element={
            isAuthenticated ? (
              <Layout
                title="Compliance Requirements"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <ComplianceRequirements />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/compliance/requirements/add"
          element={
            isAuthenticated ? (
              <Layout
                title="Add Compliance Requirement"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <AddComplianceRequirement />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/compliance/requirements/edit/:id"
          element={
            isAuthenticated ? (
              <Layout
                title="Edit Compliance Requirement"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <EditComplianceRequirement />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/compliance/status"
          element={
            isAuthenticated ? (
              <Layout
                title="Compliance Status"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <VendorComplianceAssignment user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/compliance/dashboard"
          element={
            isAuthenticated ? (
              <Layout
                title="Compliance Dashboard"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <ComplianceStatusDashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/documents/upload"
          element={
            isAuthenticated ? (
              <Layout
                title="Upload Documents"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                <VendorDocuments user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/documents"
          element={
            isAuthenticated ? (
              <Layout
                title={user?.role === "admin" || user?.role === "super_admin" ? "Document Management" : "My Documents"}
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                {user?.role === "admin" || user?.role === "super_admin" ? (
                  <DocumentManagement />
                ) : (
                  <VendorDocuments user={user} />
                )}
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/documents/expiry"
          element={
            isAuthenticated ? (
              <Layout
                title="Document Expiry Status"
                user={user}
                setIsAuthenticated={setIsAuthenticated}
              >
                {user?.role === "admin" || user?.role === "super_admin" ? (
                  <ExpiryTracking />
                ) : (
                  <VendorDocuments user={user} />
                )}
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
