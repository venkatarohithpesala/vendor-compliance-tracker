import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaStore, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTag, FaCheckCircle, FaBuilding } from "react-icons/fa";
import API from "../../api/api";
import { showToast } from "../../utils/toast";

function AddVendor({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    companyId: "",
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCompanies, setFetchingCompanies] = useState(false);
  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (user) {
      setUserRole(user.role);
      // If admin, auto-set their company
      if (user.role === "admin" && user.companyId) {
        setFormData(prev => ({
          ...prev,
          companyId: user.companyId
        }));
      }
    }
  }, [user]);

  useEffect(() => {
    if (userRole === "super_admin") {
      fetchCompaniesList();
    }
  }, [userRole]);

  const fetchCompaniesList = async () => {
    setFetchingCompanies(true);
    try {
      const response = await API.get("/companies");
      setCompanies(response.data.companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setFetchingCompanies(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vendor name is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.companyId) {
      newErrors.companyId = "Company selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        category: formData.category.trim() || null,
        companyId: formData.companyId,
      };

      await API.post("/vendors", submitData);

      showToast.success("Vendor created successfully!");
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        category: "",
        companyId: userRole === "admin" ? formData.companyId : "",
      });
      // Navigate to vendors list
      navigate("/vendors");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create vendor. Please try again.";
      showToast.error(errorMessage);
      console.error("Create vendor error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#90323d] to-[#5e0b15] px-6 py-4">
          <h2 className="text-xl font-semibold text-white">
            Vendor Information
          </h2>
          <p className="text-[#ba8a5c] text-sm mt-1">
            Add a new vendor to track compliance information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vendor Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Vendor Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaStore className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200 ${
                  errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Enter vendor name"
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email <span className="text-gray-500">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200 ${
                  errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="vendor@company.com"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Phone <span className="text-gray-500">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200"
                placeholder="+1 (555) 123-4567"
                disabled={loading}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Address <span className="text-gray-500">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200"
                placeholder="Enter vendor address"
                disabled={loading}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Category <span className="text-gray-500">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaTag className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200"
                placeholder="e.g., Software, Consulting, Manufacturing"
                disabled={loading}
              />
            </div>
          </div>

          {/* Company Selection (only for super_admin) */}
          {userRole === "super_admin" && (
            <div>
              <label
                htmlFor="companyId"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Company <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBuilding className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="companyId"
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200 ${
                    errors.companyId ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  disabled={loading || fetchingCompanies}
                >
                  <option value="">
                    {fetchingCompanies ? "Loading companies..." : "Select a company"}
                  </option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.companyId && (
                <p className="mt-1 text-sm text-red-600">{errors.companyId}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Vendor...
                </>
              ) : (
                <>
                  <FaCheckCircle className="w-5 h-5" />
                  Create Vendor
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Back Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/vendors")}
          className="inline-flex items-center gap-2 px-4 py-2 text-[#90323d] hover:text-[#5e0b15] font-medium transition-colors duration-200"
        >
          ← Back to Vendors
        </button>
      </div>
    </div>
  );
}

export default AddVendor;