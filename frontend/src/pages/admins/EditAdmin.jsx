import { useState, useEffect } from "react";
import { FaUserEdit, FaArrowLeft, FaSave, FaUser } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";
import { showToast } from "../../utils/toast";

function EditAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, [id]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/users/admins/${id}`);
      const adminData = response.data.admin;

      setAdmin(adminData);
      setFormData({
        name: adminData.name || "",
        email: adminData.email || "",
      });
      setOriginalData({
        name: adminData.name || "",
        email: adminData.email || "",
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to load admin data";
      showToast.error(errorMessage);
      console.error("Fetch admin error:", error);
      navigate("/admins");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
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
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    return formData.name !== originalData.name;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      showToast.info("No changes to save");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: formData.name.trim(),
      };

      await API.put(`/users/admins/${id}`, updateData);

      showToast.success("Admin updated successfully!");
      navigate("/admins");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update admin";
      showToast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90323d] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FaUser className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-medium">Admin not found</p>
            <p className="text-sm">The admin you're looking for doesn't exist.</p>
          </div>
          <Link
            to="/admins"
            className="px-4 py-2 bg-[#90323d] text-white rounded-lg hover:bg-[#5e0b15] transition-colors"
          >
            Back to Admins
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Link
            to="/admins"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <FaArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
              <FaUserEdit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#5e0b15]">
                Edit Admin
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Update admin name (email cannot be changed)
              </p>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
              <FaUser className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{admin.name}</h3>
              <p className="text-sm text-gray-600">{admin.email}</p>
              <p className="text-xs text-gray-500 mt-1">Role: Admin</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent transition-colors ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter admin's full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed transition-colors ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="admin@company.com"
                title="Email cannot be changed after verification"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email address is verified and cannot be changed
              </p>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
              <Link
                to="/admins"
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || !hasChanges()}
                className="px-6 py-3 bg-[#90323d] text-white font-medium rounded-lg hover:bg-[#5e0b15] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditAdmin;