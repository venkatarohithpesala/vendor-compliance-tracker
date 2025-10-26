import { useState } from "react";
import { FaUserPlus, FaArrowLeft, FaCheckCircle, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/api";
import { showToast } from "../../utils/toast";

function AddAdmin() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [inviteSent, setInviteSent] = useState(false);

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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
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
      await API.post("/users/admins", formData);
      setInviteSent(true);
      showToast.success("Admin invitation sent successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send admin invitation";
      showToast.error(errorMessage);

      // Handle specific field errors
      if (error.response?.data?.message?.includes("email")) {
        setErrors((prev) => ({ ...prev, email: "Email already exists" }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (inviteSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invitation Sent!
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              An invitation email has been sent to{" "}
              <strong>{formData.email}</strong>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-blue-800 text-left space-y-1">
              <li>The admin will receive an email with setup instructions</li>
              <li>They can click the secure link to set their password</li>
              <li>Once activated, you can assign them to a company</li>
              <li>The invitation expires in 24 hours</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/admins"
              className="px-6 py-3 bg-[#90323d] text-white font-medium rounded-lg hover:bg-[#5e0b15] transition-colors text-center"
            >
              View All Admins
            </Link>
            <button
              onClick={() => {
                setInviteSent(false);
                setFormData({ name: "", email: "" });
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Send Another Invite
            </button>
          </div>
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
              <FaUserPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#5e0b15]">
                Send Admin Invitation
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Invite a new admin user to join the system
              </p>
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent transition-colors ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="admin@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                <FaLock className="w-4 h-4" />
                Security & Process
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>No password is set by administrators</li>
                <li>User receives secure invitation email</li>
                <li>User sets their own strong password</li>
                <li>Invitation expires in 24 hours</li>
                <li>Email verification ensures account security</li>
              </ul>
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
                disabled={loading}
                className="px-6 py-3 bg-[#90323d] text-white font-medium rounded-lg hover:bg-[#5e0b15] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
      </div>
    </div>
  );
}

export default AddAdmin;
