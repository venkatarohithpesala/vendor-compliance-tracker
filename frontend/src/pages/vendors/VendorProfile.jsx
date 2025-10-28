import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaStore, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTag, FaEdit, FaSave, FaTimes, FaArrowLeft, FaBuilding, FaCalendar, FaToggleOn, FaToggleOff } from "react-icons/fa";
import API from "../../api/api";
import { showToast } from "../../utils/toast";

function VendorProfile({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    companyId: "",
  });
  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (user) {
      setUserRole(user.role);
    }
  }, [user]);

  useEffect(() => {
    if (id) {
      fetchVendor();
      if (userRole === "super_admin") {
        fetchCompaniesList();
      }
    }
  }, [id, userRole]);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/vendors/${id}`);
      setVendor(response.data.vendor);
      setFormData({
        name: response.data.vendor.name || "",
        email: response.data.vendor.email || "",
        phone: response.data.vendor.phone || "",
        address: response.data.vendor.address || "",
        category: response.data.vendor.category || "",
        companyId: response.data.vendor.companyId || "",
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to load vendor";
      showToast.error(errorMessage);
      console.error("Fetch vendor error:", error);
      navigate("/vendors");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompaniesList = async () => {
    try {
      const response = await API.get("/companies");
      setCompanies(response.data.companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Only require companyId for super_admin users who can change it
    if (userRole === "super_admin" && !formData.companyId) {
      newErrors.companyId = "Company selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        category: formData.category.trim() || null,
      };

      // Only include companyId for super_admin users
      if (userRole === "super_admin") {
        updateData.companyId = formData.companyId;
      }

      const response = await API.put(`/vendors/${id}`, updateData);
      setVendor(response.data.vendor);
      setIsEditing(false);
      showToast.success("Vendor updated successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update vendor";
      showToast.error(errorMessage);
      console.error("Update vendor error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: vendor.name || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
      category: vendor.category || "",
      companyId: vendor.companyId || "",
    });
    setIsEditing(false);
    setErrors({});
  };

  const toggleVendorStatus = async () => {
    const newStatus = vendor.status === "active" ? "inactive" : "active";
    try {
      await API.put(`/vendors/${id}/status`, { status: newStatus });
      setVendor(prev => ({ ...prev, status: newStatus }));
      showToast.success(`Vendor status updated to ${newStatus}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update vendor status";
      showToast.error(errorMessage);
      console.error("Toggle status error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#90323d]"></div>
        <span className="ml-2 text-gray-600">Loading vendor...</span>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <FaTimes className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Vendor Not Found</p>
          <p className="text-sm">The vendor you're looking for doesn't exist.</p>
        </div>
        <button
          onClick={() => navigate("/vendors")}
          className="px-4 py-2 bg-[#90323d] text-white rounded-lg hover:bg-[#5e0b15] transition-colors"
        >
          Back to Vendors
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/vendors")}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Vendors"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
            <FaStore className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#5e0b15]">{vendor.name}</h1>
            <p className="text-gray-600 mt-1">
              Vendor Profile & Information
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Toggle */}
          <button
            onClick={toggleVendorStatus}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              vendor.status === "active"
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
            title={vendor.status === "active" ? "Deactivate Vendor" : "Activate Vendor"}
          >
            {vendor.status === "active" ? (
              <FaToggleOn className="w-4 h-4" />
            ) : (
              <FaToggleOff className="w-4 h-4" />
            )}
            {vendor.status === "active" ? "Active" : "Inactive"}
          </button>

          {/* Edit/Save/Cancel Buttons */}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#90323d] text-white rounded-lg hover:bg-[#5e0b15] transition-colors"
            >
              <FaEdit className="w-4 h-4" />
              Edit Vendor
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <FaSave className="w-4 h-4" />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#90323d] to-[#5e0b15] px-6 py-4">
          <h2 className="text-xl font-semibold text-white">
            Vendor Details
          </h2>
          <p className="text-[#ba8a5c] text-sm mt-1">
            Complete vendor information and contact details
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendor Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaStore className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200 ${
                      errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Enter vendor name"
                    disabled={saving}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FaStore className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 font-medium">{vendor.name}</span>
                </div>
              )}
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200 ${
                      errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="vendor@company.com"
                    disabled={saving}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                  <a
                    href={`mailto:${vendor.email}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {vendor.email}
                  </a>
                </div>
              )}
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              {isEditing ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200"
                    placeholder="+1 (555) 123-4567"
                    disabled={saving}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">
                    {vendor.phone ? (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="text-green-600 hover:text-green-800 hover:underline"
                      >
                        {vendor.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              {isEditing ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200"
                    placeholder="e.g., Software, Consulting, Manufacturing"
                    disabled={saving}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FaTag className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">
                    {vendor.category || <span className="text-gray-400">Not specified</span>}
                  </span>
                </div>
              )}
            </div>

            {/* Address - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              {isEditing ? (
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200"
                    placeholder="Enter vendor address"
                    disabled={saving}
                  />
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-900">
                    {vendor.address || <span className="text-gray-400">Not provided</span>}
                  </span>
                </div>
              )}
            </div>

            {/* Company (only for super_admin in edit mode) */}
            {userRole === "super_admin" && isEditing && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200 ${
                      errors.companyId ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    disabled={saving}
                  >
                    <option value="">Select a company</option>
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

            {/* Company Display (read-only) */}
            {userRole === "super_admin" && !isEditing && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FaBuilding className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">
                    {vendor.company?.name || <span className="text-gray-400">Not assigned</span>}
                  </span>
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Created
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FaCalendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">
                  {new Date(vendor.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorProfile;