import { useState, useEffect } from "react";
import {
    FaFileAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaDownload,
    FaEye,
    FaSearch,
    FaShieldAlt,
    FaFilter,
} from "react-icons/fa";
import API from "../../api/api.js";
import { showToast } from "../../utils/toast.js";

function DocumentManagement() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [reviewModal, setReviewModal] = useState({
        show: false,
        document: null,
        action: "",
        notes: "",
    });

    useEffect(() => {
        fetchDocuments();
    }, [filterStatus]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterStatus !== "all") params.status = filterStatus;

            const response = await API.get("/documents", { params });
            setDocuments(response.data.documents);
        } catch (error) {
            console.error("Error fetching documents:", error);
            showToast.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (doc) => {
        try {
            showToast.info("Preparing download...");
            const response = await API.get(`/documents/download/${doc.id}`);
            const link = document.createElement("a");
            link.href = response.data.downloadUrl;
            link.setAttribute("download", doc.originalFilename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download error:", error);
            showToast.error("Failed to download document");
        }
    };

    const handleReview = async () => {
        if (!reviewModal.document) return;

        try {
            await API.put(`/documents/review/${reviewModal.document.id}`, {
                status: reviewModal.action,
                reviewNotes: reviewModal.notes,
            });

            showToast.success(`Document ${reviewModal.action} successfully`);
            setReviewModal({ show: false, document: null, action: "", notes: "" });
            fetchDocuments();
        } catch (error) {
            console.error("Review error:", error);
            showToast.error("Failed to update document status");
        }
    };

    const filteredDocs = documents.filter((doc) => {
        const searchStr = searchTerm.toLowerCase();
        return (
            doc.originalFilename.toLowerCase().includes(searchStr) ||
            doc.compliance?.vendor?.name.toLowerCase().includes(searchStr) ||
            doc.compliance?.requirement?.name.toLowerCase().includes(searchStr)
        );
    });

    const getStatusBadge = (status) => {
        const badges = {
            approved: "bg-green-100 text-green-800 border-green-200",
            rejected: "bg-red-100 text-red-800 border-red-200",
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${badges[status] || "bg-gray-100 text-gray-800 border-gray-200"
                    }`}
            >
                {status.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
                        <FaShieldAlt className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[#5e0b15]">Document Review</h1>
                        <p className="text-gray-600 mt-1">
                            Manage and verify compliance submissions from your vendors
                        </p>
                    </div>
                </div>

                <div className="flex bg-white rounded-xl border border-gray-200 shadow-sm p-1">
                    {["all", "pending", "approved", "rejected"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${filterStatus === s
                                    ? "bg-[#90323d] text-white shadow-md shadow-[#90323d]/20 scale-[1.02]"
                                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "Total Submissions", count: documents.length, icon: FaFileAlt, color: "text-blue-600", bg: "bg-blue-100" },
                    { label: "Pending Review", count: documents.filter(d => d.status === 'pending').length, icon: FaClock, color: "text-yellow-600", bg: "bg-yellow-100" },
                    { label: "Approved Docs", count: documents.filter(d => d.status === 'approved').length, icon: FaCheckCircle, color: "text-green-600", bg: "bg-green-100" },
                    { label: "Rejected Docs", count: documents.filter(d => d.status === 'rejected').length, icon: FaTimesCircle, color: "text-red-600", bg: "bg-red-100" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-100">
                    <div className="max-w-xs">
                        <div className="relative focus-within:text-[#90323d] text-gray-400 transition-colors duration-200">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by vendor or file..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:border-[#90323d] focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-[#90323D] border-t-transparent rounded-full animate-spin"></div>
                                            Loading documents...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDocs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                                        No documents found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredDocs.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-[#faeff0] text-[#90323d] border border-[#f5dadd]">
                                                    <FaFileAlt className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{doc.originalFilename}</div>
                                                    <div className="text-xs text-gray-500">{doc.compliance?.requirement?.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            {doc.compliance?.vendor?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(doc.status)}
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase">
                                                {new Date(doc.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDownload(doc)}
                                                    className="p-2 text-gray-600 hover:text-[#90323d] hover:bg-gray-50 rounded-lg transition-all"
                                                    title="Download"
                                                >
                                                    <FaDownload className="w-4 h-4" />
                                                </button>

                                                {doc.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => setReviewModal({ show: true, document: doc, action: "rejected", notes: "" })}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Reject"
                                                        >
                                                            <FaTimesCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setReviewModal({ show: true, document: doc, action: "approved", notes: "" })}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                            title="Approve"
                                                        >
                                                            <FaCheckCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => setReviewModal({ show: true, document: doc, action: doc.status, notes: doc.reviewNotes, viewOnly: true })}
                                                        className="p-2 text-gray-400 hover:text-gray-600"
                                                        title="View Review Notes"
                                                    >
                                                        <FaEye className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal */}
            {reviewModal.show && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-reveal">
                        <div className={`p-8 ${reviewModal.action === "approved" ? "bg-green-50" : "bg-red-50"}`}>
                            <h3 className={`text-2xl font-black ${reviewModal.action === "approved" ? "text-green-800" : "text-red-800"}`}>
                                {reviewModal.viewOnly ? "Review History" : "Review Submission"}
                            </h3>
                            <p className="text-gray-600 mt-2 font-medium">
                                Document: <span className="font-bold">{reviewModal.document?.originalFilename}</span>
                            </p>
                        </div>

                        <div className="p-8">
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                                {reviewModal.viewOnly ? "Admin Feedback" : "Notes & Feedback (Optional)"}
                            </label>
                            <textarea
                                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#90323d] outline-none transition-colors resize-none h-40 font-medium disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder={reviewModal.viewOnly ? "" : "Provide details for the vendor about this assessment..."}
                                value={reviewModal.notes}
                                onChange={(e) => setReviewModal({ ...reviewModal, notes: e.target.value })}
                                readOnly={reviewModal.viewOnly}
                                disabled={reviewModal.viewOnly}
                            />

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setReviewModal({ show: false, document: null, action: "", notes: "" })}
                                    className="flex-1 py-4 text-sm font-black text-gray-500 hover:bg-gray-100 rounded-2xl transition-colors"
                                >
                                    {reviewModal.viewOnly ? "Close" : "Cancel"}
                                </button>
                                {!reviewModal.viewOnly && (
                                    <button
                                        onClick={handleReview}
                                        className={`flex-1 py-4 text-sm font-black text-white rounded-2xl shadow-xl transition-all hover:scale-[1.02] ${reviewModal.action === "approved"
                                                ? "bg-green-600 shadow-green-200"
                                                : "bg-red-600 shadow-red-200"
                                            }`}
                                    >
                                        Confirm {reviewModal.action === "approved" ? "Approval" : "Rejection"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentManagement;
