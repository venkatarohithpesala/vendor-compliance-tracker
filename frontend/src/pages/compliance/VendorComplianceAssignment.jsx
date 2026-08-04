import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaClipboardCheck,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaMinusCircle,
  FaFileAlt,
  FaEye,
} from "react-icons/fa";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import API from "../../api/api";
import { showToast } from "../../utils/toast";
import ComplianceDocuments from "../../components/ComplianceDocuments";

function VendorComplianceAssignment({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Filters and search
  const [globalFilter, setGlobalFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Assignment form
  const [assignmentForm, setAssignmentForm] = useState({
    vendorId: "",
    requirementId: "",
  });
  const [assigning, setAssigning] = useState(false);

  const columns = [
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
            <FaUser className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {row.original.vendor?.name}
            </div>
            <div className="text-sm text-gray-500">
              {row.original.vendor?.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "requirement",
      header: "Requirement",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <FaClipboardCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {row.original.requirement?.name}
            </div>
            <div className="text-sm text-gray-500">
              {row.original.requirement?.category?.name} •{" "}
              {row.original.requirement?.frequency}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-100 px-2 py-1 rounded"
          onClick={column.getToggleSortingHandler()}
        >
          Status
          {column.getIsSorted() === "asc" && <FaSortUp className="w-3 h-3" />}
          {column.getIsSorted() === "desc" && (
            <FaSortDown className="w-3 h-3" />
          )}
          {!column.getIsSorted() && <FaSort className="w-3 h-3 opacity-50" />}
        </div>
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = {
          compliant: {
            icon: FaCheckCircle,
            color: "text-green-600",
            bg: "bg-green-100",
            label: "Compliant",
          },
          "non-compliant": {
            icon: FaTimesCircle,
            color: "text-red-600",
            bg: "bg-red-100",
            label: "Non-Compliant",
          },
          pending: {
            icon: FaClock,
            color: "text-yellow-600",
            bg: "bg-yellow-100",
            label: "Pending",
          },
          expired: {
            icon: FaExclamationTriangle,
            color: "text-orange-600",
            bg: "bg-orange-100",
            label: "Expired",
          },
          "not-applicable": {
            icon: FaMinusCircle,
            color: "text-gray-600",
            bg: "bg-gray-100",
            label: "Not Applicable",
          },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const IconComponent = config.icon;

        return (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}
          >
            <IconComponent className="w-3 h-3" />
            {config.label}
          </div>
        );
      },
    },
    {
      accessorKey: "nextDueDate",
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-100 px-2 py-1 rounded"
          onClick={column.getToggleSortingHandler()}
        >
          Next Due
          {column.getIsSorted() === "asc" && <FaSortUp className="w-3 h-3" />}
          {column.getIsSorted() === "desc" && (
            <FaSortDown className="w-3 h-3" />
          )}
          {!column.getIsSorted() && <FaSort className="w-3 h-3 opacity-50" />}
        </div>
      ),
      cell: ({ row }) => {
        const dueDate = row.original.nextDueDate;
        if (!dueDate) return <span className="text-gray-400">Not set</span>;

        const date = new Date(dueDate);
        const today = new Date();
        const isOverdue = date < today && row.original.status !== "compliant";

        return (
          <span
            className={`text-sm ${
              isOverdue ? "text-red-600 font-medium" : "text-gray-700"
            }`}
          >
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "assignedBy",
      header: "Assigned By",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.assignedBy}</span>
      ),
    },
    {
      id: "documents",
      header: "Documents",
      cell: ({ row }) => (
        <button
          onClick={() => {
            setSelectedAssignment(row.original);
            setShowDocumentModal(true);
          }}
          className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          title="View/Manage Documents"
        >
          <FaFileAlt className="w-3 h-3" />
          <FaEye className="w-3 h-3" />
        </button>
      ),
    },
  ];

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = assignments;

    // Apply vendor filter
    if (vendorFilter) {
      filtered = filtered.filter(
        (assignment) => assignment.vendor?.id === parseInt(vendorFilter)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(
        (assignment) => assignment.status === statusFilter
      );
    }

    return filtered;
  }, [assignments, vendorFilter, statusFilter]);

  // Get unique vendors for filter dropdown
  const uniqueVendors = useMemo(() => {
    const vendors = [
      ...new Set(assignments.map((a) => a.vendor).filter(Boolean)),
    ];
    return vendors.sort((a, b) => a.name.localeCompare(b.name));
  }, [assignments]);

  // Get status options
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "compliant", label: "Compliant" },
    { value: "non-compliant", label: "Non-Compliant" },
    { value: "expired", label: "Expired" },
    { value: "not-applicable", label: "Not Applicable" },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
    onGlobalFilterChange: setGlobalFilter,
    state: {
      globalFilter,
    },
  });

  useEffect(() => {
    fetchAssignments();
    fetchVendors();
    fetchRequirements();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await API.get("/compliance/assignments");
      setAssignments(response.data.assignments);
      setError(null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to load compliance assignments";
      setError(errorMessage);
      showToast.error(errorMessage);
      console.error("Fetch assignments error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await API.get("/vendors");
      setVendors(response.data.vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchRequirements = async () => {
    try {
      const response = await API.get("/compliance/requirements");
      setRequirements(response.data.requirements);
    } catch (error) {
      console.error("Error fetching requirements:", error);
    }
  };

  const handleAssignRequirement = async (e) => {
    e.preventDefault();

    if (!assignmentForm.vendorId || !assignmentForm.requirementId) {
      showToast.error("Please select both a vendor and a requirement");
      return;
    }

    setAssigning(true);
    try {
      const response = await API.post("/compliance/assignments", {
        vendorId: parseInt(assignmentForm.vendorId),
        requirementId: parseInt(assignmentForm.requirementId),
      });

      showToast.success("Compliance requirement assigned successfully");
      setAssignments((prev) => [response.data.assignment, ...prev]);
      setShowAssignModal(false);
      setAssignmentForm({ vendorId: "", requirementId: "" });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to assign requirement";
      showToast.error(errorMessage);
      console.error("Assign requirement error:", error);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#90323d]"></div>
        <span className="ml-2 text-gray-600">
          Loading compliance assignments...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <FaTimesCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error Loading Assignments</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={fetchAssignments}
          className="px-4 py-2 bg-[#90323d] text-white rounded-lg hover:bg-[#5e0b15] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
            <FaClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#5e0b15]">
              Compliance Status
            </h1>
            <p className="text-gray-600 mt-1">
              Assign requirements to vendors and track compliance status
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <FaPlus className="w-4 h-4" />
          Assign Requirement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FaClipboardCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Assignments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Compliant</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter((a) => a.status === "compliant").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <FaClock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter((a) => a.status === "pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <FaTimesCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter((a) => a.status === "non-compliant").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <FaExclamationTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  assignments.filter((a) => {
                    if (!a.nextDueDate || a.status === "compliant")
                      return false;
                    return new Date(a.nextDueDate) < new Date();
                  }).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search and Inline Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              {/* Search */}
              <div className="max-w-xs">
                <div className="relative focus-within:text-[#90323d] text-gray-400 transition-colors duration-200">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:border-[#90323d] focus:outline-none"
                  />
                </div>
              </div>

              {/* Inline Filter Options */}
              {showFilters && (
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Vendor:
                    </label>
                    <select
                      value={vendorFilter}
                      onChange={(e) => setVendorFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent text-sm"
                    >
                      <option value="">All Vendors</option>
                      {uniqueVendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Status:
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent text-sm"
                    >
                      <option value="">All Statuses</option>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setVendorFilter("");
                      setStatusFilter("");
                      setGlobalFilter("");
                    }}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 ${
                  showFilters
                    ? "bg-[#90323d] text-white border-[#90323d]"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
                title="Filters"
              >
                <FaFilter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        {assignments.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 rounded-full bg-gray-100 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FaClipboardCheck className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No compliance assignments yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by assigning compliance requirements to your vendors
              to begin tracking their compliance status
            </p>
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <FaPlus className="w-5 h-5" />
              Assign First Requirement
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {assignments.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700">
                Showing{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
                of {table.getFilteredRowModel().rows.length} assignments
              </div>

              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#90323d] focus:border-transparent"
              >
                {[10, 20, 30, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize} per page
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-sm text-gray-700">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Requirement Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Compliance Requirement
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Select a vendor and requirement to create a compliance
                assignment
              </p>
            </div>

            <form onSubmit={handleAssignRequirement}>
              <div className="space-y-4">
                {/* Vendor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vendor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignmentForm.vendorId}
                    onChange={(e) =>
                      setAssignmentForm((prev) => ({
                        ...prev,
                        vendorId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent"
                    required
                  >
                    <option value="">Choose a vendor...</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name} ({vendor.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Requirement Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Requirement <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignmentForm.requirementId}
                    onChange={(e) =>
                      setAssignmentForm((prev) => ({
                        ...prev,
                        requirementId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent"
                    required
                  >
                    <option value="">Choose a requirement...</option>
                    {requirements.map((requirement) => (
                      <option key={requirement.id} value={requirement.id}>
                        {requirement.name} ({requirement.category?.name} -{" "}
                        {requirement.frequency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
                  disabled={assigning}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-2 bg-[#90323d] text-white font-medium rounded-lg hover:bg-[#5e0b15] transition-colors disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Assign Requirement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Management Modal */}
      {showDocumentModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Document Management
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {selectedAssignment.requirement?.name} -{" "}
                  {selectedAssignment.vendor?.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDocumentModal(false);
                  setSelectedAssignment(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaTimesCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <ComplianceDocuments
                complianceId={selectedAssignment.id}
                userRole={user?.role || "vendor"}
                refreshTrigger={() => fetchAssignments()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorComplianceAssignment;
