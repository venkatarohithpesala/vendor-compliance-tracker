import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBuilding, FaGlobe, FaCheckCircle, FaArrowLeft, FaChevronDown } from "react-icons/fa";
import API from "../../api/api";
import { showToast } from "../../utils/toast";

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Active",
    dot: "#4a9e6e",
    bg: "rgba(74,158,110,0.10)",
    color: "#2e6b49",
  },
  {
    value: "inactive",
    label: "Inactive",
    dot: "#9ca3af",
    bg: "rgba(156,163,175,0.12)",
    color: "#4b5563",
  },
];

function StatusDropdown({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = STATUS_OPTIONS.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 border rounded-xl outline-none transition-all duration-200"
        style={{
          borderColor: open ? "var(--color-primary)" : "var(--color-border)",
          backgroundColor: "var(--color-page-bg)",
          boxShadow: open ? "0 0 0 3px rgba(140,155,130,0.15)" : "none",
          fontFamily: "var(--font-sidebar)",
          fontSize: "0.875rem",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: selected.dot }}
          />
          <span style={{ color: "var(--color-text)" }}>{selected.label}</span>
        </div>
        <FaChevronDown
          className="w-3 h-3 transition-transform duration-200"
          style={{
            color: "var(--color-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute z-10 w-full mt-1.5 rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 8px 24px rgba(31,41,55,0.10)",
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors duration-150 text-left"
              style={{
                fontFamily: "var(--font-sidebar)",
                fontSize: "0.875rem",
                backgroundColor: value === opt.value ? opt.bg : "transparent",
              }}
              onMouseEnter={(e) => { if (value !== opt.value) e.currentTarget.style.backgroundColor = "var(--color-page-bg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = value === opt.value ? opt.bg : "transparent"; }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: opt.dot }}
              />
              <span style={{ color: opt.color, fontWeight: value === opt.value ? 500 : 400 }}>
                {opt.label}
              </span>
              {value === opt.value && (
                <FaCheckCircle className="w-3 h-3 ml-auto" style={{ color: opt.dot }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
    <div className="max-w-2xl mx-auto" style={{ fontFamily: "var(--font-sidebar)" }}>
      {/* Form Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 2px 16px rgba(31,41,55,0.07)",
        }}
      >
        {/* Card header — neutral, accent left border */}
        <div
          className="px-6 py-5"
          style={{
            borderBottom: "1px solid var(--color-border)",
            borderLeft: "4px solid var(--color-primary)",
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            Company Information
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
            Fill in the details below to onboard a new company
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Company Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text)", fontFamily: "var(--font-sidebar)" }}
            >
              Company Name <span style={{ color: "#e05252" }}>*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaBuilding style={{ color: "var(--color-muted)" }} className="h-4 w-4" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl outline-none transition-all duration-200 ${
                  errors.name ? "border-red-300 bg-red-50" : ""
                }`}
                style={{
                  borderColor: errors.name ? undefined : "var(--color-border)",
                  backgroundColor: "var(--color-page-bg)",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-sidebar)",
                  fontSize: "0.875rem",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(140,155,130,0.15)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.name ? undefined : "var(--color-border)"; e.currentTarget.style.boxShadow = "none"; }}
                placeholder="Enter company name"
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs" style={{ color: "#e05252" }}>{errors.name}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <label
              htmlFor="website"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text)", fontFamily: "var(--font-sidebar)" }}
            >
              Website <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaGlobe style={{ color: "var(--color-muted)" }} className="h-4 w-4" />
              </div>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl outline-none transition-all duration-200 ${
                  errors.website ? "border-red-300 bg-red-50" : ""
                }`}
                style={{
                  borderColor: errors.website ? undefined : "var(--color-border)",
                  backgroundColor: "var(--color-page-bg)",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-sidebar)",
                  fontSize: "0.875rem",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(140,155,130,0.15)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.website ? undefined : "var(--color-border)"; e.currentTarget.style.boxShadow = "none"; }}
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>
            {errors.website && (
              <p className="mt-1 text-xs" style={{ color: "#e05252" }}>{errors.website}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text)", fontFamily: "var(--font-sidebar)" }}
            >
              Status
            </label>
            <StatusDropdown
              value={formData.status}
              onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
              disabled={loading}
            />
            <p className="mt-1 text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-sidebar)" }}>
              Set the initial status for the company
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--color-primary)",
                fontFamily: "var(--font-sidebar)",
                fontSize: "0.9rem",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating Company...
                </>
              ) : (
                <>
                  <FaCheckCircle className="w-4 h-4" />
                  Create Company
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Back Button */}
      <div className="mt-5 text-center">
        <button
          onClick={() => navigate("/home")}
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-sidebar)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-muted)"; }}
        >
          <FaArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default AddCompany;
