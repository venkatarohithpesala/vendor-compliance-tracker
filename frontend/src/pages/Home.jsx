import { useState, useEffect } from 'react';
import axios from '../api/api';
import { showToast } from '../utils/toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FiUsers, FiFileText, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#9ca3af'];

function Home({ user }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            showToast('Error loading dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const role = user?.role?.toLowerCase();
    const isSuperAdmin = role === 'super_admin';
    const isVendor = role === 'vendor';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5e0b15]"></div>
            </div>
        );
    }

    // ---- 1. SUPER ADMIN VIEW (Platform Stats) ----
    if (isSuperAdmin) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-white to-gray-50">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Platform Overview</h1>
                        <p className="mt-2 text-gray-500 font-medium">Monitoring system-wide metrics and company growth.</p>
                    </div>
                    <div className="mt-4 md:mt-0 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                        <span className="text-sm font-semibold text-gray-400">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={<FiUsers />} title="Total Companies" value={stats?.overview?.totalCompanies || 0} color="bg-indigo-50 text-indigo-600" />
                    <StatCard icon={<FiFileText />} title="Active Admins" value={stats?.overview?.totalAdmins || 0} color="bg-emerald-50 text-emerald-600" />
                    <StatCard icon={<FiUsers />} title="Global Vendors" value={stats?.overview?.totalVendors || 0} color="bg-amber-50 text-amber-600" />
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Recently Registered Companies</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-gray-400 font-bold uppercase tracking-wider">
                                    <th className="pb-4">Company Name</th>
                                    <th className="pb-4">Plan</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4 text-right">Registered On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {stats?.recentCompanies?.map((company) => (
                                    <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-semibold text-gray-700">{company.name}</td>
                                        <td className="py-4 text-gray-500">{company.plan}</td>
                                        <td className="py-4">
                                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded uppercase">{company.status}</span>
                                        </td>
                                        <td className="py-4 text-right text-gray-400">{new Date(company.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // ---- 2. VENDOR VIEW (Self Compliance) ----
    if (isVendor) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                {/* ... Vendor code ... */}
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 bg-gradient-to-r from-white to-gray-50">
                    <h1 className="text-3xl font-bold text-[#5e0b15]">Welcome back, {user?.name}!</h1>
                    <p className="mt-2 text-gray-500 font-medium">Manage your compliance documents and track your performance.</p>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                            <h3 className="text-lg font-bold text-emerald-800">Compliant Requirements</h3>
                            <p className="text-3xl font-bold text-emerald-600 mt-2">{stats?.overview?.statusBreakdown?.compliant || 0}</p>
                        </div>
                        <div className="bg-rose-50 p-6 rounded-xl border border-rose-100">
                            <h3 className="text-lg font-bold text-rose-800">Action Required</h3>
                            <p className="text-3xl font-bold text-rose-600 mt-2">{stats?.overview?.statusBreakdown?.['non-compliant'] || 0}</p>
                        </div>
                    </div>

                    <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="text-lg font-bold text-blue-800 mb-4">Upcoming Expiries</h3>
                        {stats?.overview?.upcomingExpiries?.length > 0 ? (
                            <ul className="space-y-3">
                                {stats.overview.upcomingExpiries.map((expiry, i) => (
                                    <li key={i} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="font-semibold text-gray-700">{expiry.requirement}</span>
                                        <span className="text-rose-500 font-bold text-sm">Expires: {new Date(expiry.expiryDate).toLocaleDateString()}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-blue-600 italic">No upcoming expiries found.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ---- 3. COMPANY ADMIN VIEW (Compliance Statistics) ----
    const pieData = stats?.overview?.statusBreakdown ? Object.entries(stats.overview.statusBreakdown).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    })) : [];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-white to-gray-50">
                <div>
                    <h1 className="text-3xl font-bold text-[#5e0b15]">Welcome back, {user?.name}!</h1>
                    <p className="mt-2 text-gray-500 font-medium">Here's what's happening across your vendors today.</p>
                </div>
                <div className="mt-4 md:mt-0 px-4 py-2 bg-[#5e0b15]/5 rounded-full border border-[#5e0b15]/10">
                    <span className="text-sm font-semibold text-[#5e0b15]">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<FiUsers />}
                    title="Total Vendors"
                    value={stats?.overview?.totalVendors || 0}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    icon={<FiFileText />}
                    title="Pending Reviews"
                    value={stats?.overview?.pendingReviews || 0}
                    color="bg-amber-50 text-amber-600"
                />
                <StatCard
                    icon={<FiCheckCircle />}
                    title="Compliant Records"
                    value={stats?.overview?.statusBreakdown?.compliant || 0}
                    color="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                    icon={<FiAlertCircle />}
                    title="Non-Compliant"
                    value={stats?.overview?.statusBreakdown?.['non-compliant'] || 0}
                    color="bg-rose-50 text-rose-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Compliance Distribution Chart */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Compliance Status</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {pieData.map((item, index) => (
                            <div key={item.name} className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-xs text-gray-500 font-medium">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Recent Document Submissions</h3>
                        <button className="text-sm font-semibold text-[#5e0b15] hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-gray-400 font-bold uppercase tracking-wider">
                                    <th className="pb-4">Vendor</th>
                                    <th className="pb-4">Requirement</th>
                                    <th className="pb-4 text-center">Status</th>
                                    <th className="pb-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((activity) => (
                                    <tr key={activity.id} className="text-sm hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-semibold text-gray-700">{activity.vendor}</td>
                                        <td className="py-4 text-gray-500">{activity.requirement}</td>
                                        <td className="py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${activity.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                activity.status === 'pending_review' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-rose-50 text-rose-600 border border-rose-100'
                                                }`}>
                                                {activity.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right text-gray-400 font-medium">
                                            {new Date(activity.date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-400 italic">No recent activity found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, color }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`p-4 rounded-xl text-xl ${color}`}>
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-medium text-gray-400">{title}</h4>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

export default Home;
