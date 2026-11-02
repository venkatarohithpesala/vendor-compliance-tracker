import { useState } from "react";
import { FaUserPlus, FaArrowLeft, FaCheckCircle, FaLock, FaUser, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/api";
import { showToast } from "../../utils/toast";

function AddAdmin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [inviteSent, setInviteSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await API.post("/users/admins", formData);
      setInviteSent(true);
      showToast.success("Admin invitation sent successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send admin invitation";
      showToast.error(errorMessage);
      if (error.response?.data?.message?.includes("email"))
        setErrors((prev) => ({ ...prev, email: "Email already exists" }));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    borderColor: hasError ? "#fca5a5" : "var(--color-border)",
    backgroundColor: hasError ? "#fef2f2" : "var(--color-page-bg)",
    color: "var(--color-text)",
    fontFamily: "var(--font-sidebar)",
    fontSize: "0.875rem",
  });

  const handleFocus = (e) => {
    e.currentTarget.style.borderColor = "var(--color-primary)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(140,155,130,0.15)";
  };
  const handleBlur = (e, hasError) => {
    e.currentTarget.style.borderColor = hasError ? "#fca5a5" : "var(--color-border)";
    e.currentTarget.style.boxShadow = "none";
  };

  // ── Success state ──
  if (inviteSent) {
    return (
      <div className="max-w-2xl mx-auto" style={{ fontFamily: "var(--font-sidebar)" }}>
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 2px 16px rgba(31,41,55,0.07)",
          }}
        >
          <div
            className="px-6 py-5"
            style={{ borderBottom: "1px solid var(--color-border)", borderLeft: "4px solid var(--color-primary)" }}
          >
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Invitation Sent</h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
              The admin account setup email has been dispatched
            </p>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(var(--color-primary-rgb), 0.12)", color: "var(--color-primary)" }}
              >
                <FaCheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Invitation sent to <strong>{formData.email}</strong>
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                  They'll receive a secure link to set their password
                </p>
              </div>
            </div>

            <div
              className="rounded-xl p-4 text-sm space-y-1.5"
              style={{
                backgroundColor: "rgba(var(--color-primary-rgb), 0.06)",
                border: "1px solid rgba(var(--color-primary-rgb), 0.18)",
                color: "#3a4e34",
                fontFamily: "var(--font-sidebar)",
              }}
            >
              <p className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>What happens next?</p>
              {[
                "The admin will receive an email with setup instructions",
                "They can click the secure link to set their password",
                "Once activated, they can be assigned to a company",
                "The invitation link expires in 24 hours",
              ].map((item) => (
                <p key={item} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--color-primary)" }} />
                  {item}
                </p>
              ))}
            </div>

            <div className="flex gap-3 pt-1">
              <Link
                to="/admins"
                className="flex-1 flex items-center justify-center py-2.5 text-white font-medium rounded-xl text-sm transition-all duration-200"
                style={{ backgroundColor: "var(--color-primary)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
              >
                View All Admins
              </Link>
              <button
                onClick={() => { setInviteSent(false); setFormData({ name: "", email: "" }); }}
                className="flex-1 py-2.5 font-medium rounded-xl text-sm transition-all duration-200"
                style={{
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-page-bg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface)"; }}
              >
                Send Another Invite
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ──
  return (
    <div className="max-w-2xl mx-auto" style={{ fontFamily: "var(--font-sidebar)" }}>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 2px 16px rgba(31,41,55,0.07)",
        }}
      >
        {/* Card header */}
        <div
          className="px-6 py-5"
          style={{ borderBottom: "1px solid var(--color-border)", borderLeft: "4px solid var(--color-primary)" }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
            Send Admin Invitation
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
            Invite a new admin user to join the system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text)" }}>
              Full Name <span style={{ color: "#e05252" }}>*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-4 w-4" style={{ color: "var(--color-muted)" }} />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 border rounded-xl outline-none transition-all duration-200"
                style={inputStyle(errors.name)}
                onFocus={handleFocus}
                onBlur={(e) => handleBlur(e, errors.name)}
                placeholder="Enter admin's full name"
                disabled={loading}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs" style={{ color: "#e05252" }}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text)" }}>
              Email Address <span style={{ color: "#e05252" }}>*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-4 w-4" style={{ color: "var(--color-muted)" }} />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 border rounded-xl outline-none transition-all duration-200"
                style={inputStyle(errors.email)}
                onFocus={handleFocus}
                onBlur={(e) => handleBlur(e, errors.email)}
                placeholder="admin@company.com"
                disabled={loading}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs" style={{ color: "#e05252" }}>{errors.email}</p>}
          </div>

          {/* Security notice */}
          <div
            className="rounded-xl p-4 text-sm space-y-1.5"
            style={{
              backgroundColor: "rgba(var(--color-primary-rgb), 0.06)",
              border: "1px solid rgba(var(--color-primary-rgb), 0.18)",
            }}
          >
            <p className="font-semibold flex items-center gap-2 mb-2" style={{ color: "var(--color-text)" }}>
              <FaLock className="w-3.5 h-3.5" style={{ color: "var(--color-primary)" }} />
              Security &amp; Process
            </p>
            {[
              "No password is set by administrators",
              "User receives a secure invitation email",
              "User sets their own strong password",
              "Invitation expires in 24 hours",
            ].map((item) => (
              <p key={item} className="flex items-start gap-2" style={{ color: "#3a4e34" }}>
                <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--color-primary)" }} />
                {item}
              </p>
            ))}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--color-primary)", fontSize: "0.9rem" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Sending Invite...
                </>
              ) : (
                <>
                  <FaUserPlus className="w-4 h-4" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Back link */}
      <div className="mt-5 text-center">
        <button
          onClick={() => navigate("/admins")}
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-sidebar)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-muted)"; }}
        >
          <FaArrowLeft className="w-3.5 h-3.5" /> Back to Admins
        </button>
      </div>
    </div>
  );
}

export default AddAdmin;
