import { useState, useRef, useCallback } from "react";
import { FaCloudUploadAlt, FaFileAlt, FaPlus, FaSpinner } from "react-icons/fa";
import API from "../api/api.js";
import { showToast } from "../utils/toast.js";

function DocumentUpload({ complianceId, onDocumentUploaded }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("compliance_evidence");
  const [description, setDescription] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef(null);

  const documentTypes = [
    { value: "compliance_evidence", label: "Compliance Evidence" },
    { value: "certificate", label: "Certificate" },
    { value: "license", label: "License" },
    { value: "insurance", label: "Insurance Document" },
    { value: "audit_report", label: "Audit Report" },
    { value: "financial_statement", label: "Financial Statement" },
    { value: "contract", label: "Contract" },
    { value: "policy", label: "Policy Document" },
    { value: "training_certificate", label: "Training Certificate" },
    { value: "other", label: "Other" },
  ];

  const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "text/plain",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file) => {
    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      showToast.error(
        `File type not allowed. Please select: PDF, DOC, DOCX, JPG, PNG, TXT, CSV, XLSX`
      );
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      showToast.error("File size exceeds 10MB limit");
      return;
    }

    setSelectedFile(file);
    setShowUploadModal(true);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("documentType", documentType);
      formData.append("description", description);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await API.post(
        `/documents/upload/${complianceId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      showToast.success("Document uploaded successfully!");

      // Reset form
      setSelectedFile(null);
      setDocumentType("compliance_evidence");
      setDescription("");
      setShowUploadModal(false);
      setUploadProgress(0);

      // Notify parent component
      if (onDocumentUploaded) {
        onDocumentUploaded(response.data.document);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to upload document";
      showToast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? "border-[#90323d] bg-red-50"
            : "border-gray-300 hover:border-[#90323d] hover:bg-gray-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={`p-4 rounded-full ${
              isDragOver
                ? "bg-[#90323d] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <FaCloudUploadAlt className="w-8 h-8" />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragOver
                ? "Drop your document here"
                : "Upload Compliance Document"}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Drag & drop your file here, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT, CSV, XLSX (Max:
              10MB)
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#90323d] text-white font-medium rounded-lg hover:bg-[#5e0b15] transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Choose File
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.csv,.xlsx"
          onChange={handleFileInputChange}
        />
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Document
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Review document details before uploading
              </p>
            </div>

            {/* File Preview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaFileAlt className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent"
                required
              >
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional notes about this document..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Uploading...
                  </span>
                  <span className="text-sm text-gray-600">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#90323d] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setDocumentType("compliance_evidence");
                  setDescription("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-[#90323d] text-white font-medium rounded-lg hover:bg-[#5e0b15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaCloudUploadAlt className="w-4 h-4" />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DocumentUpload;
