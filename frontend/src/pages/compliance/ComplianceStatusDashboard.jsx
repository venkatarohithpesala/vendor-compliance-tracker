import { useState, useEffect, useMemo } from "react";
import {
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaMinusCircle,
  FaClipboardCheck,
  FaDownload,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import API from "../../api/api";
import { showToast } from "../../utils/toast";

function ComplianceStatusDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, vendorsRes, requirementsRes] = await Promise.all([
        API.get("/compliance/assignments"),
        API.get("/vendors"),
        API.get("/compliance/requirements"),
      ]);

      setAssignments(assignmentsRes.data.assignments);
      setVendors(vendorsRes.data.vendors);
      setRequirements(requirementsRes.data.requirements);
      setError(null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load dashboard data";
      setError(errorMessage);
      showToast.error(errorMessage);
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter assignments based on time range and vendor
  const filteredAssignments = useMemo(() => {
    let filtered = assignments;

    // Filter by vendor
    if (selectedVendor) {
      filtered = filtered.filter(
        (assignment) => assignment.vendor?.id === parseInt(selectedVendor)
      );
    }

    // Filter by time range
    if (timeRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (timeRange) {
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }

      filtered = filtered.filter((assignment) => {
        const createdAt = new Date(assignment.createdAt);
        return createdAt >= cutoffDate;
      });
    }

    return filtered;
  }, [assignments, selectedVendor, timeRange]);

  // Calculate compliance statistics
  const complianceStats = useMemo(() => {
    const total = filteredAssignments.length;
    const compliant = filteredAssignments.filter(
      (a) => a.status === "compliant"
    ).length;
    const nonCompliant = filteredAssignments.filter(
      (a) => a.status === "non-compliant"
    ).length;
    const pending = filteredAssignments.filter(
      (a) => a.status === "pending"
    ).length;
    const expired = filteredAssignments.filter(
      (a) => a.status === "expired"
    ).length;
    const notApplicable = filteredAssignments.filter(
      (a) => a.status === "not-applicable"
    ).length;

    const overdue = filteredAssignments.filter((a) => {
      if (!a.nextDueDate || a.status === "compliant") return false;
      return new Date(a.nextDueDate) < new Date();
    }).length;

    const complianceRate =
      total > 0 ? Math.round((compliant / total) * 100) : 0;

    return {
      total,
      compliant,
      nonCompliant,
      pending,
      expired,
      notApplicable,
      overdue,
      complianceRate,
    };
  }, [filteredAssignments]);

  // Vendor compliance data for bar chart
  const vendorComplianceData = useMemo(() => {
    const vendorStats = {};

    filteredAssignments.forEach((assignment) => {
      const vendorId = assignment.vendor?.id;
      const vendorName = assignment.vendor?.name;

      if (!vendorId) return;

      if (!vendorStats[vendorId]) {
        vendorStats[vendorId] = {
          name: vendorName,
          total: 0,
          compliant: 0,
          nonCompliant: 0,
          pending: 0,
        };
      }

      vendorStats[vendorId].total += 1;

      switch (assignment.status) {
        case "compliant":
          vendorStats[vendorId].compliant += 1;
          break;
        case "non-compliant":
          vendorStats[vendorId].nonCompliant += 1;
          break;
        case "pending":
          vendorStats[vendorId].pending += 1;
          break;
        default:
          break;
      }
    });

    return Object.values(vendorStats)
      .map((stat) => ({
        ...stat,
        complianceRate:
          stat.total > 0 ? Math.round((stat.compliant / stat.total) * 100) : 0,
      }))
      .sort((a, b) => b.complianceRate - a.complianceRate);
  }, [filteredAssignments]);

  // Status distribution for pie chart
  const statusDistributionData = useMemo(() => {
    const statusCounts = {
      compliant: complianceStats.compliant,
      "non-compliant": complianceStats.nonCompliant,
      pending: complianceStats.pending,
      expired: complianceStats.expired,
      "not-applicable": complianceStats.notApplicable,
    };

    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        name: status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: count,
        color: {
          Compliant: "#10B981",
          "Non Compliant": "#EF4444",
          Pending: "#F59E0B",
          Expired: "#F97316",
          "Not Applicable": "#6B7280",
        }[status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())],
      }))
      .filter((item) => item.value > 0);
  }, [complianceStats]);

  // Category compliance data
  const categoryComplianceData = useMemo(() => {
    const categoryStats = {};

    filteredAssignments.forEach((assignment) => {
      const categoryId = assignment.requirement?.category?.id;
      const categoryName = assignment.requirement?.category?.name;

      if (!categoryId) return;

      if (!categoryStats[categoryId]) {
        categoryStats[categoryId] = {
          name: categoryName,
          total: 0,
          compliant: 0,
        };
      }

      categoryStats[categoryId].total += 1;

      if (assignment.status === "compliant") {
        categoryStats[categoryId].compliant += 1;
      }
    });

    return Object.values(categoryStats)
      .map((stat) => ({
        ...stat,
        complianceRate:
          stat.total > 0 ? Math.round((stat.compliant / stat.total) * 100) : 0,
      }))
      .sort((a, b) => b.complianceRate - a.complianceRate);
  }, [filteredAssignments]);

  // Recent assignments (last 10)
  const recentAssignments = useMemo(() => {
    return [...filteredAssignments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  }, [filteredAssignments]);

  const timeRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "week", label: "Last Week" },
    { value: "month", label: "Last Month" },
    { value: "quarter", label: "Last Quarter" },
    { value: "year", label: "Last Year" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#90323d]"></div>
        <span className="ml-2 text-gray-600">
          Loading compliance dashboard...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <FaTimesCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error Loading Dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-[#90323d] text-white rounded-lg hover:bg-[#5e0b15] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
            <FaChartBar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#5e0b15]">
              Compliance Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive overview of vendor compliance status and trends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent"
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>

          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <FaDownload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Compliance Rate
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {complianceStats.complianceRate}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {complianceStats.compliant} of {complianceStats.total}{" "}
                assignments
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <FaCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Assignments
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {complianceStats.total}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Across {vendors.length} vendors
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <FaClipboardCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Items</p>
              <p className="text-3xl font-bold text-red-600">
                {complianceStats.overdue}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Require immediate attention
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <FaExclamationTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Review
              </p>
              <p className="text-3xl font-bold text-yellow-600">
                {complianceStats.pending}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Awaiting vendor response
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <FaClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Compliance Status Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {statusDistributionData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Compliance Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Vendor Compliance Rates
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorComplianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="complianceRate" fill="#90323d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Compliance and Recent Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Compliance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Compliance by Category
          </h3>
          <div className="space-y-4">
            {categoryComplianceData.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {category.complianceRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#90323d] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.complianceRate}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {category.compliant} of {category.total} compliant
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Assignments
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentAssignments.map((assignment, index) => {
              const statusConfig = {
                compliant: {
                  icon: FaCheckCircle,
                  color: "text-green-600",
                  bg: "bg-green-100",
                },
                "non-compliant": {
                  icon: FaTimesCircle,
                  color: "text-red-600",
                  bg: "bg-red-100",
                },
                pending: {
                  icon: FaClock,
                  color: "text-yellow-600",
                  bg: "bg-yellow-100",
                },
                expired: {
                  icon: FaExclamationTriangle,
                  color: "text-orange-600",
                  bg: "bg-orange-100",
                },
                "not-applicable": {
                  icon: FaMinusCircle,
                  color: "text-gray-600",
                  bg: "bg-gray-100",
                },
              };

              const config =
                statusConfig[assignment.status] || statusConfig.pending;
              const IconComponent = config.icon;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <IconComponent className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {assignment.requirement?.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {assignment.vendor?.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </div>
                    {assignment.nextDueDate && (
                      <div className="text-xs text-gray-600">
                        Due:{" "}
                        {new Date(assignment.nextDueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Summary Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {complianceStats.compliant}
            </div>
            <div className="text-sm text-gray-600">Compliant</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {complianceStats.nonCompliant}
            </div>
            <div className="text-sm text-gray-600">Non-Compliant</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {complianceStats.pending}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {complianceStats.expired}
            </div>
            <div className="text-sm text-gray-600">Expired</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplianceStatusDashboard;
