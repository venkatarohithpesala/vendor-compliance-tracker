import { useState, useEffect } from "react";
import {
    FaHourglassHalf,
    FaBell,
    FaExclamationTriangle,
    FaSearch,
    FaCalendarAlt,
    FaClipboardList,
    FaSync,
} from "react-icons/fa";
import API from "../../api/api.js";
import { showToast } from "../../utils/toast.js";

function ExpiryTracking() {
    const [expiries, setExpiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sendingReminder, setSendingReminder] = useState(null);

    useEffect(() => {
        fetchExpiries();
    }, []);

    const fetchExpiries = async () => {
        try {
            setLoading(true);
            const response = await API.get("/compliance/expiring");
            setExpiries(response.data.expiringRecords);
        } catch (error) {
            console.error("Error fetching expiries:", error);
            showToast.error("Failed to load upcoming expiries");
        } finally {
            setLoading(false);
        }
    };

    const handleSendReminder = async (recordId) => {
        try {
            setSendingReminder(recordId);
            await API.post(`/compliance/remind/${recordId}`);
            showToast.success("Reminder queued successfully");
            // Optionally refresh to update "last reminder" context if we had it
        } catch (error) {
            console.error("Error sending reminder:", error);
            showToast.error("Failed to send reminder");
        } finally {
            setSendingReminder(null);
        }
    };

    const filteredExpiries = expiries.filter((record) => {
        const searchStr = searchTerm.toLowerCase();
        return (
            record.vendor?.name.toLowerCase().includes(searchStr) ||
            record.requirement?.name.toLowerCase().includes(searchStr)
        );
    });

    const getRemainingDays = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getStatusStyle = (days) => {
        if (days <= 0) return "text-red-600 bg-red-100 border-red-200";
        if (days <= 7) return "text-orange-600 bg-orange-100 border-orange-200";
        if (days <= 15) return "text-yellow-600 bg-yellow-100 border-yellow-200";
        return "text-blue-600 bg-blue-100 border-blue-200";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90323d]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
                        <FaHourglassHalf className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[#5e0b15]">Expiry Tracking</h1>
                        <p className="text-gray-600 mt-1">
                            Monitor upcoming document expirations and notify vendors proactively.
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchExpiries}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                    <FaSync className="w-4 h-4" />
                    Refresh Data
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100 text-red-600">
                            <FaExclamationTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Critical ({"<"}7 Days)
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {expiries.filter(e => getRemainingDays(e.expiryDate) <= 7).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-500">
                            <FaBell className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Warning ({"<"}15 Days)
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {expiries.filter(e => getRemainingDays(e.expiryDate) <= 15 && getRemainingDays(e.expiryDate) > 7).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#faeff0] text-[#90323d]">
                            <FaClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Total Tracked
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {expiries.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Search */}
                <div className="p-6 border-b border-gray-100">
                    <div className="max-w-xs">
                        <div className="relative focus-within:text-[#90323d] text-gray-400 transition-colors duration-200">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by vendor or requirement..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:border-[#90323d] focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredExpiries.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-[#faeff0] text-[#90323d] flex items-center justify-center mr-3 font-semibold text-xs border border-[#f5dadd]">
                                                {record.vendor?.name.charAt(0)}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{record.vendor?.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 font-medium">{record.requirement?.name}</div>
                                        <div className="text-xs text-gray-500">{record.requirement?.category?.name || 'General Compliance'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm text-gray-700">
                                            <FaCalendarAlt className="mr-2 text-gray-400" />
                                            {new Date(record.expiryDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const days = getRemainingDays(record.expiryDate);
                                            return (
                                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(days)}`}>
                                                    {days <= 0 ? 'Expired' : `${days} Days Remaining`}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleSendReminder(record.id)}
                                            disabled={sendingReminder === record.id}
                                            className="inline-flex items-center text-[#90323d] hover:text-[#5e0b15] font-semibold text-sm transition-colors disabled:opacity-50"
                                        >
                                            <FaBell className="mr-2" />
                                            {sendingReminder === record.id ? 'Sending...' : 'Remind'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredExpiries.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                                        No upcoming expiries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ExpiryTracking;
