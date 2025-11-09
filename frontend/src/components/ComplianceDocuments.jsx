import { useState, useEffect } from "react";
import { FaFileAlt, FaUpload, FaList } from "react-icons/fa";
import DocumentUpload from "./DocumentUpload";
import DocumentList from "./DocumentList";
import API from "../api/api.js";
import { showToast } from "../utils/toast.js";

function ComplianceDocuments({ complianceId, userRole, refreshTrigger }) {
  const [activeTab, setActiveTab] = useState("upload");
  const [complianceDetails, setComplianceDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceDetails();
  }, [complianceId]);

  const fetchComplianceDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/compliance/${complianceId}`);
      setComplianceDetails(response.data.compliance);
    } catch (error) {
      console.error("Error fetching compliance details:", error);
      showToast.error("Failed to load compliance details");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    // Switch to list view after successful upload
    setActiveTab("list");
    // Trigger refresh of document list
    if (refreshTrigger) refreshTrigger();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#90323d]"></div>
        <span className="ml-2 text-gray-600">
          Loading compliance details...
        </span>
      </div>
    );
  }

  if (!complianceDetails) {
    return (
      <div className="text-center py-12">
        <FaFileAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Compliance Record Not Found
        </h3>
        <p className="text-gray-600">
          The requested compliance record could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Document Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {complianceDetails.requirementName} -{" "}
              {complianceDetails.vendorName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                complianceDetails.status === "compliant"
                  ? "bg-green-100 text-green-800"
                  : complianceDetails.status === "non_compliant"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {complianceDetails.status
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "upload"
                ? "bg-[#90323d] text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <FaUpload className="w-4 h-4" />
            Upload Documents
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "list"
                ? "bg-[#90323d] text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <FaList className="w-4 h-4" />
            View Documents
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "upload" && (
          <DocumentUpload
            complianceId={complianceId}
            userRole={userRole}
            onUploadSuccess={handleUploadSuccess}
          />
        )}

        {activeTab === "list" && (
          <DocumentList
            complianceId={complianceId}
            userRole={userRole}
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>
    </div>
  );
}

export default ComplianceDocuments;
