import { useState, useEffect } from "react";
import {
    FaFileAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaDownload,
    FaEye,
    FaSearch,
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
        <div className="p-6 max-w-[1600px] mx-auto min-h-screen bg-gray-50/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#5e0b15] tracking-tight">
                        Document Review Queue
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        Manage and verify compliance submissions from your vendors
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search vendors or files..."
                            className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#90323D] focus:border-transparent outline-none w-full md:w-80 transition-all bg-white shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-white rounded-xl border border-gray-200 shadow-sm p-1">
                        {["all", "pending", "approved", "rejected"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${filterStatus === s
                                        ? "bg-[#90323D] text-white shadow-md shadow-[#90323D]/20 scale-[1.02]"
                                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "Total Submissions", count: documents.length, icon: FaFileAlt, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Pending Review", count: documents.filter(d => d.status === 'pending').length, icon: FaClock, color: "text-yellow-600", bg: "bg-yellow-50" },
                    { label: "Recently Approved", count: documents.filter(d => d.status === 'approved').length, icon: FaCheckCircle, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Rejections", count: documents.filter(d => d.status === 'rejected').length, icon: FaTimesCircle, color: "text-red-600", bg: "bg-red-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-[#90323D]/30 transition-all">
                        <div>
                            <p className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-900">{stat.count}</p>
                        </div>
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden ring-1 ring-black/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Vendor & Requirement</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Document details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-[#90323D] border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-gray-500 font-medium">Fetching secure documents...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDocs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <FaFileAlt className="w-16 h-16 text-gray-400" />
                                            <p className="text-lg font-bold text-gray-600">No documents found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredDocs.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-base">{doc.compliance?.vendor?.name}</span>
                                                <span className="text-sm text-gray-500 font-medium mt-0.5">{doc.compliance?.requirement?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-[#90323D]/10 group-hover:text-[#90323D] transition-colors">
                                                    <FaFileAlt className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col max-w-[200px] overflow-hidden">
                                                    <span className="font-bold text-gray-700 truncate" title={doc.originalFilename}>
                                                        {doc.originalFilename}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-tighter">
                                                        {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {doc.mimeType?.split('/')[1]?.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {getStatusBadge(doc.status)}
                                            <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">
                                                Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDownload(doc)}
                                                    className="p-2 text-gray-500 hover:text-[#90323D] hover:bg-[#90323D]/10 rounded-lg transition-all"
                                                    title="Download"
                                                >
                                                    <FaDownload className="w-4 h-4" />
                                                </button>

                                                {doc.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => setReviewModal({ show: true, document: doc, action: "rejected", notes: "" })}
                                                            className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => setReviewModal({ show: true, document: doc, action: "approved", notes: "" })}
                                                            className="px-4 py-2 text-sm font-bold bg-[#90323D] text-white rounded-lg shadow-lg shadow-[#90323D]/20 hover:scale-105 transition-all"
                                                        >
                                                            Approve
                                                        </button>
                                                    </>
                                                )}

                                                {(doc.status === 'approved' || doc.status === 'rejected') && (
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
                        <div className={`p-8 ${reviewModal.action === 'approved' ? 'bg-green-50' : 'bg-red-50'}`}>
                            <h3 className={`text-2xl font-black ${reviewModal.action === 'approved' ? 'text-green-800' : 'text-red-800'}`}>
                                {reviewModal.viewOnly ? 'Review History' : `Review Submission`}
                            </h3>
                            <p className="text-gray-600 mt-2 font-medium">
                                Document: <span className="font-bold">{reviewModal.document?.originalFilename}</span>
                            </p>
                        </div>

                        <div className="p-8">
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                                {reviewModal.viewOnly ? 'Admin Feedback' : 'Notes & Feedback (Optional)'}
                            </label>
                            <textarea
                                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#90323D] outline-none transition-colors resize-none h-40 font-medium disabled:bg-gray-50 disabled:text-gray-500"
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
                                    {reviewModal.viewOnly ? 'Close' : 'Cancel'}
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
