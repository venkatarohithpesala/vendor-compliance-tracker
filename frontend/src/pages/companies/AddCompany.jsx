import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBuilding, FaGlobe, FaCheckCircle } from "react-icons/fa";
import API from "../../api/api";
import { showToast } from "../../utils/toast";

function AddCompany() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
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
      newErrors.name = "Company name is required";
    }
    if (
      formData.website &&
      !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(formData.website)
    ) {
      newErrors.website =
        "Please enter a valid URL (e.g., https://example.com)";
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
      const response = await API.post("/companies", {
        name: formData.name.trim(),
        website: formData.website.trim() || null,
        status: formData.status,
      });

      showToast.success("Company created successfully!");
      // Reset form
      setFormData({
        name: "",
        website: "",
        status: "active",
      });
      // Navigate to companies list (assuming it exists)
      navigate("/companies");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create company. Please try again.";
      showToast.error(errorMessage);
      console.error("Create company error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Form Card */}
      <div
        className="rounded-2xl shadow-xl overflow-hidden"
        style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <div className="px-6 py-4" style={{ backgroundColor: "var(--color-primary)" }}>
          <h2 className="text-xl font-semibold text-white">
            Company Information
          </h2>
          <p className="text-sm mt-1 text-white/80">
            Fill in the details below to onboard a new company
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Company Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Company Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaBuilding className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  errors.name ? "border-red-300 bg-red-50" : ""
                }`}
                style={{
                  borderColor: errors.name ? undefined : "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                  "--tw-ring-color": "var(--color-primary)",
                }}
                placeholder="Enter company name"
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <label
              htmlFor="website"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Website <span style={{ color: "var(--color-muted)" }}>(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaGlobe className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  errors.website ? "border-red-300 bg-red-50" : ""
                }`}
                style={{
                  borderColor: errors.website ? undefined : "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                  "--tw-ring-color": "var(--color-primary)",
                }}
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Status
            </label>
            <div className="relative">
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="block w-full px-3 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                  "--tw-ring-color": "var(--color-primary)",
                }}
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
              Set the initial status for the company
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ backgroundColor: "var(--color-primary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Company...
                </>
              ) : (
                <>
                  <FaCheckCircle className="w-5 h-5" />
                  Create Company
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Back Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/home")}
          className="inline-flex items-center gap-2 px-4 py-2 font-medium transition-colors duration-200"
          style={{ color: "var(--color-primary)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-primary)"; }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default AddCompany;
