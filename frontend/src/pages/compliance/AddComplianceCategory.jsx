import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTag, FaArrowLeft, FaSave, FaFileAlt } from "react-icons/fa";
import API from "../../api/api";
import { showToast } from "../../utils/toast";

function AddComplianceCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

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
      newErrors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Category name must be less than 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
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
        description: formData.description.trim() || null,
      };

      const response = await API.post("/compliance/categories", submitData);
      showToast.success("Compliance category created successfully");
      navigate("/compliance/categories");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create compliance category";
      showToast.error(errorMessage);
      console.error("Create category error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/compliance/categories")}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Categories"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
            <FaTag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#5e0b15]">Add Compliance Category</h1>
            <p className="text-gray-600 mt-1">
              Create a new compliance category for organizing requirements
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#90323d] to-[#5e0b15] px-6 py-4">
          <h2 className="text-xl font-semibold text-white">
            Category Details
          </h2>
          <p className="text-[#ba8a5c] text-sm mt-1">
            Configure the compliance category settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200 ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="e.g., GDPR, HIPAA, ISO 27001"
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Choose a clear, descriptive name for the compliance category
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FaFileAlt className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200 ${
                    errors.description ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Describe what this compliance category covers..."
                  disabled={loading}
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Optional: Provide additional context about this compliance category
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/compliance/categories")}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#90323d] text-white font-medium rounded-lg hover:bg-[#5e0b15] transition-colors disabled:opacity-50"
            >
              <FaSave className="w-4 h-4" />
              {loading ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddComplianceCategory;