import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FaFileAlt,
  FaUpload,
  FaList,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import API from "../../api/api.js";
import { showToast } from "../../utils/toast.js";
import DocumentUpload from "../../components/DocumentUpload";
import DocumentList from "../../components/DocumentList";

function VendorDocuments({ user }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // Set initial tab based on route
    if (location.pathname === "/documents/upload") return "upload";
    if (location.pathname === "/documents/expiry") return "list"; // Could be enhanced for expiry view
    return "upload"; // Default to upload for better UX
  });
  const [complianceRecords, setComplianceRecords] = useState([]);
  const [selectedCompliance, setSelectedCompliance] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.vendorId) {
      fetchVendorCompliance();
    }
  }, [user]);

  const fetchVendorCompliance = async () => {
    if (!user || !user.vendorId) {
      console.log("User or vendorId not available yet");
      return;
    }

    try {
      setLoading(true);
      const response = await API.get(`/compliance/vendors/${user.vendorId}`);
      setComplianceRecords(response.data.complianceRecords);

      // Auto-select first pending compliance record
      const pendingRecords = response.data.complianceRecords.filter(
        (record) =>
          record.status === "pending" || record.status === "non-compliant"
      );
      if (pendingRecords.length > 0) {
        setSelectedCompliance(pendingRecords[0].id.toString());
      }
    } catch (error) {
      console.error("Error fetching vendor compliance:", error);
      showToast.error("Failed to load compliance records");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    // Switch to list view after successful upload
    setActiveTab("list");
    // Refresh compliance records to update status
    fetchVendorCompliance();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "compliant":
        return <FaCheckCircle className="w-4 h-4 text-green-600" />;
      case "non-compliant":
        return <FaTimesCircle className="w-4 h-4 text-red-600" />;
      case "pending":
      default:
        return <FaClock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800 border-green-200";
      case "non-compliant":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  if (loading || !user || !user.vendorId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#90323d]"></div>
        <span className="ml-2 text-gray-600">
          Loading your compliance records...
        </span>
      </div>
    );
  }

  const selectedRecord = complianceRecords.find(
    (record) => record.id.toString() === selectedCompliance
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
            <FaFileAlt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#5e0b15]">My Documents</h1>
            <p className="text-gray-600 mt-1">
              Upload compliance documents and track submission status
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Records Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Compliance Requirements
        </h2>

        {complianceRecords.length === 0 ? (
          <div className="text-center py-8">
            <FaFileAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No compliance requirements assigned yet.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Contact your administrator for assignments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceRecords.map((record) => (
              <div
                key={record.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedCompliance === record.id.toString()
                    ? "border-[#90323d] bg-[#90323d]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedCompliance(record.id.toString())}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {record.requirement?.name}
                  </h3>
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      record.status
                    )}`}
                  >
                    {getStatusIcon(record.status)}
                    {record.status
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {record.requirement?.category?.name}
                </p>
                {record.nextDueDate && (
                  <p className="text-xs text-gray-500">
                    Due: {new Date(record.nextDueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Management */}
      {selectedCompliance && selectedRecord && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Selected Requirement Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedRecord.requirement?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedRecord.requirement?.category?.name} •{" "}
                  {selectedRecord.requirement?.frequency}
                </p>
              </div>
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  selectedRecord.status
                )}`}
              >
                {getStatusIcon(selectedRecord.status)}
                {selectedRecord.status
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
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
                complianceId={selectedCompliance}
                userRole="vendor"
                onUploadSuccess={handleUploadSuccess}
              />
            )}

            {activeTab === "list" && (
              <DocumentList
                complianceId={selectedCompliance}
                userRole="vendor"
                refreshTrigger={() => fetchVendorCompliance()}
              />
            )}
          </div>
        </div>
      )}

      {/* No Selection Message */}
      {!selectedCompliance && complianceRecords.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FaFileAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Select a Compliance Requirement
          </h3>
          <p className="text-gray-600">
            Choose a requirement from above to upload or view documents.
          </p>
        </div>
      )}
    </div>
  );
}

export default VendorDocuments;
