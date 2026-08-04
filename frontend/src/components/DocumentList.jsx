import { useState, useEffect } from "react";
import {
  FaFileAlt,
  FaDownload,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSpinner,
} from "react-icons/fa";
import API from "../api/api.js";
import { showToast } from "../utils/toast.js";

function DocumentList({ complianceId, userRole, refreshTrigger }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingDocument, setReviewingDocument] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, [complianceId, refreshTrigger]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/documents/compliance/${complianceId}`);
      setDocuments(response.data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      showToast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await API.get(`/documents/download/${documentId}`);
      const downloadUrl = response.data.downloadUrl;

      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast.success("Download started");
    } catch (error) {
      console.error("Error downloading document:", error);
      showToast.error("Failed to download document");
    }
  };

  const handleReview = (document, action) => {
    setReviewingDocument(document);
    setReviewAction(action);
    setReviewNotes("");
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewingDocument) return;

    try {
      await API.put(`/documents/review/${reviewingDocument.id}`, {
        status: reviewAction,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      showToast.success(
        `Document ${
          reviewAction === "approved" ? "approved" : "rejected"
        } successfully`
      );

      // Refresh documents list
      fetchDocuments();

      // Close modal
      setShowReviewModal(false);
      setReviewingDocument(null);
      setReviewAction("");
      setReviewNotes("");
    } catch (error) {
      console.error("Error reviewing document:", error);
      showToast.error("Failed to review document");
    }
  };

  const handleDelete = async (documentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await API.delete(`/documents/${documentId}`);
      showToast.success("Document deleted successfully");
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      showToast.error("Failed to delete document");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <FaCheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <FaTimesCircle className="w-4 h-4 text-red-600" />;
      case "pending_review":
      default:
        return <FaClock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending_review":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="w-6 h-6 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 rounded-full bg-gray-100 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <FaFileAlt className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No documents uploaded yet
        </h3>
        <p className="text-gray-600">
          Documents will appear here once they are uploaded for review.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {documents.map((document) => (
          <div
            key={document.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* File Icon */}
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaFileAlt className="w-6 h-6 text-blue-600" />
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-medium text-gray-900 truncate">
                      {document.originalFilename}
                    </h4>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        document.status
                      )}`}
                    >
                      {getStatusIcon(document.status)}
                      {document.status
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      {document.documentType
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>{" "}
                      {formatFileSize(document.fileSize)}
                    </div>
                    <div>
                      <span className="font-medium">Uploaded:</span>{" "}
                      {formatDate(document.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">By:</span>{" "}
                      {document.uploadedBy}
                    </div>
                  </div>

                  {document.description && (
                    <p className="text-sm text-gray-700 mb-3">
                      <span className="font-medium">Description:</span>{" "}
                      {document.description}
                    </p>
                  )}

                  {document.reviewNotes && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Review Notes:</span>{" "}
                        {document.reviewNotes}
                      </p>
                      {document.reviewedBy && (
                        <p className="text-xs text-gray-500 mt-1">
                          Reviewed by {document.reviewedBy} on{" "}
                          {formatDate(document.updatedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() =>
                    handleDownload(document.id, document.originalFilename)
                  }
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <FaDownload className="w-4 h-4" />
                </button>

                {/* Admin-only actions */}
                {userRole === "admin" &&
                  document.status === "pending_review" && (
                    <>
                      <button
                        onClick={() => handleReview(document, "approved")}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <FaCheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReview(document, "rejected")}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <FaTimesCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                {/* Delete button (available to both vendors and admins) */}
                <button
                  onClick={() => handleDelete(document.id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {showReviewModal && reviewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {reviewAction === "approved" ? "Approve" : "Reject"} Document
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {reviewingDocument.originalFilename}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Notes (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={`Add notes about why this document is being ${
                  reviewAction === "approved" ? "approved" : "rejected"
                }...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewingDocument(null);
                  setReviewAction("");
                  setReviewNotes("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReview}
                className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                  reviewAction === "approved"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {reviewAction === "approved" ? "Approve" : "Reject"} Document
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DocumentList;
