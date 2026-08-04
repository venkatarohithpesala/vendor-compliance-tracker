import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaArrowLeft, FaSave, FaTag, FaClock, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import API from "../../api/api";
import { showToast } from "../../utils/toast";

function AddComplianceRequirement() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    frequency: "annual",
    defaultDueDate: "",
    renewalPeriodMonths: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await API.get("/compliance/categories");
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast.error("Failed to load compliance categories");
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
      newErrors.name = "Requirement name is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category selection is required";
    }

    if (!formData.frequency) {
      newErrors.frequency = "Frequency is required";
    } else {
      const validFrequencies = ['one-time', 'annual', 'semi-annual', 'quarterly', 'monthly'];
      if (!validFrequencies.includes(formData.frequency)) {
        newErrors.frequency = "Invalid frequency selected";
      }
    }

    if (formData.renewalPeriodMonths && (isNaN(formData.renewalPeriodMonths) || formData.renewalPeriodMonths < 1)) {
      newErrors.renewalPeriodMonths = "Renewal period must be a positive number";
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
        categoryId: parseInt(formData.categoryId),
        frequency: formData.frequency,
        defaultDueDate: formData.defaultDueDate || null,
        renewalPeriodMonths: formData.renewalPeriodMonths ? parseInt(formData.renewalPeriodMonths) : null,
      };

      const response = await API.post("/compliance/requirements", submitData);
      showToast.success("Compliance requirement created successfully");
      navigate("/compliance/requirements");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create compliance requirement";
      showToast.error(errorMessage);
      console.error("Create requirement error:", error);
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
            onClick={() => navigate("/compliance/requirements")}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Requirements"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
            <FaShieldAlt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#5e0b15]">Add Compliance Requirement</h1>
            <p className="text-gray-600 mt-1">
              Create a new compliance requirement for vendor tracking
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#90323d] to-[#5e0b15] px-6 py-4">
          <h2 className="text-xl font-semibold text-white">
            Requirement Details
          </h2>
          <p className="text-[#ba8a5c] text-sm mt-1">
            Configure the compliance requirement settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Requirement Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Requirement Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaShieldAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200 ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="e.g., Annual Security Audit, GDPR Compliance Review"
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
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
                  rows={3}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200"
                  placeholder="Describe what this compliance requirement entails..."
                  disabled={loading}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTag className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200 ${
                    errors.categoryId ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
              )}
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Frequency <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaClock className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200 ${
                    errors.frequency ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  disabled={loading}
                >
                  <option value="one-time">One-time</option>
                  <option value="annual">Annual</option>
                  <option value="semi-annual">Semi-annual</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              {errors.frequency && (
                <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>
              )}
            </div>

            {/* Default Due Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Default Due Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="defaultDueDate"
                  value={formData.defaultDueDate}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200"
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Optional: Set a default due date for this requirement type
              </p>
            </div>

            {/* Renewal Period */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Renewal Period (Months)
              </label>
              <input
                type="number"
                name="renewalPeriodMonths"
                value={formData.renewalPeriodMonths}
                onChange={handleInputChange}
                min="1"
                className={`block w-full px-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#90323d] focus:border-[#90323d] transition-all duration-200 ${
                  errors.renewalPeriodMonths ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="12"
                disabled={loading}
              />
              {errors.renewalPeriodMonths && (
                <p className="mt-1 text-sm text-red-600">{errors.renewalPeriodMonths}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                How many months until renewal is required
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/compliance/requirements")}
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
              {loading ? "Creating..." : "Create Requirement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddComplianceRequirement;