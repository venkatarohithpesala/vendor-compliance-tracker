import { useState, useEffect, useMemo } from "react";
import {
  FaStore,
  FaEnvelope,
  FaPhone,
  FaTag,
  FaEye,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaToggleOn,
  FaToggleOff,
  FaTrash,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaDownload,
  FaCheckSquare,
  FaSquare,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
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

function VendorsList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  // New state for advanced features
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="rounded border-gray-300 text-[#90323d] focus:ring-[#90323d]"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300 text-[#90323d] focus:ring-[#90323d]"
          />
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-100 px-2 py-1 rounded"
          onClick={column.getToggleSortingHandler()}
        >
          Vendor
          {column.getIsSorted() === "asc" && <FaSortUp className="w-3 h-3" />}
          {column.getIsSorted() === "desc" && <FaSortDown className="w-3 h-3" />}
          {!column.getIsSorted() && <FaSort className="w-3 h-3 opacity-50" />}
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
            <FaStore className="w-4 h-4" />
          </div>
          <div>
            <Link
              to={`/vendors/${row.original.id}`}
              className="font-medium text-gray-900 hover:text-[#90323d] transition-colors cursor-pointer"
            >
              {row.original.name}
            </Link>
            <div className="text-sm text-gray-500">ID: {row.original.id}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) =>
        row.original.email ? (
          <a
            href={`mailto:${row.original.email}`}
            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            <FaEnvelope className="w-4 h-4" />
            {row.original.email}
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) =>
        row.original.phone ? (
          <a
            href={`tel:${row.original.phone}`}
            className="text-green-600 hover:text-green-800 hover:underline flex items-center gap-1"
          >
            <FaPhone className="w-4 h-4" />
            {row.original.phone}
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-100 px-2 py-1 rounded"
          onClick={column.getToggleSortingHandler()}
        >
          Category
          {column.getIsSorted() === "asc" && <FaSortUp className="w-3 h-3" />}
          {column.getIsSorted() === "desc" && <FaSortDown className="w-3 h-3" />}
          {!column.getIsSorted() && <FaSort className="w-3 h-3 opacity-50" />}
        </div>
      ),
      cell: ({ row }) =>
        row.original.category ? (
          <div className="flex items-center gap-2">
            <FaTag className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{row.original.category}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
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
          {column.getIsSorted() === "desc" && <FaSortDown className="w-3 h-3" />}
          {!column.getIsSorted() && <FaSort className="w-3 h-3 opacity-50" />}
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleVendorStatus(row.original.id, row.original.status)}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              row.original.status === "active"
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            {row.original.status === "active" ? (
              <FaToggleOn className="w-4 h-4" />
            ) : (
              <FaToggleOff className="w-4 h-4" />
            )}
            {row.original.status === "active" ? "Active" : "Inactive"}
          </button>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-100 px-2 py-1 rounded"
          onClick={column.getToggleSortingHandler()}
        >
          Created
          {column.getIsSorted() === "asc" && <FaSortUp className="w-3 h-3" />}
          {column.getIsSorted() === "desc" && <FaSortDown className="w-3 h-3" />}
          {!column.getIsSorted() && <FaSort className="w-3 h-3 opacity-50" />}
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/vendors/${row.original.id}`)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="View Vendor Profile"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(row.original)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete Vendor"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Filtered and processed data
  const filteredData = useMemo(() => {
    let filtered = vendors;

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(vendor => vendor.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(vendor => vendor.category === categoryFilter);
    }

    return filtered;
  }, [vendors, statusFilter, categoryFilter]);

  // Get unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(vendors.map(v => v.category).filter(Boolean))];
    return categories.sort();
  }, [vendors]);

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
      rowSelection: selectedVendors,
    },
    onRowSelectionChange: setSelectedVendors,
    enableRowSelection: true,
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await API.get("/vendors");
      setVendors(response.data.vendors);
      setError(null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load vendors";
      setError(errorMessage);
      showToast.error(errorMessage);
      console.error("Fetch vendors error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVendorStatus = async (vendorId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const response = await API.put(`/vendors/${vendorId}/status`, {
        status: newStatus,
      });
      // Update the local state
      setVendors((prev) =>
        prev.map((vendor) =>
          vendor.id === vendorId
            ? { ...vendor, status: newStatus }
            : vendor
        )
      );
      showToast.success(`Vendor status updated to ${newStatus}`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update vendor status";
      showToast.error(errorMessage);
      console.error("Toggle status error:", error);
    }
  };

  const handleDeleteClick = (vendor) => {
    setVendorToDelete(vendor);
    setShowDeleteModal(true);
  };

  const exportToCSV = () => {
    // Check if any vendors are selected
    const selectedIds = Object.keys(selectedVendors);
    if (selectedIds.length === 0) {
      showToast.warning('Please select vendors to export');
      return;
    }

    // Get only the selected vendors
    const selectedVendorsData = vendors.filter(vendor => selectedVendors[vendor.id]);

    const dataToExport = selectedVendorsData.map(vendor => ({
      Name: vendor.name,
      Email: vendor.email,
      Phone: vendor.phone,
      Category: vendor.category,
      Status: vendor.status,
      Company: vendor.company?.name || '',
      Created: new Date(vendor.createdAt).toLocaleDateString(),
      CreatedBy: vendor.createdBy,
    }));

    const csvContent = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `selected_vendors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast.success(`${selectedIds.length} vendor(s) exported successfully`);
  };

  const confirmDelete = async () => {
    if (!vendorToDelete) return;

    try {
      await API.delete(`/vendors/${vendorToDelete.id}`);
      setVendors((prev) => prev.filter((vendor) => vendor.id !== vendorToDelete.id));
      showToast.success("Vendor deleted successfully");
      setShowDeleteModal(false);
      setVendorToDelete(null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete vendor";
      showToast.error(errorMessage);
      console.error("Delete vendor error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#90323d]"></div>
        <span className="ml-2 text-gray-600">Loading vendors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <FaTimesCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error Loading Vendors</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={fetchVendors}
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
            <FaStore className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#5e0b15]">Vendors</h1>
            <p className="text-gray-600 mt-1">
              Manage vendor compliance and information
            </p>
          </div>
        </div>

        <Link
          to="/vendors/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <FaPlus className="w-4 h-4" />
          Add Vendor
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FaStore className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Vendors
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {vendors.length}
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
              <p className="text-sm font-medium text-gray-600">
                Active Vendors
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {vendors.filter((v) => v.status === "active").length}
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
              <p className="text-sm font-medium text-gray-600">
                Inactive Vendors
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {vendors.filter((v) => v.status === "inactive").length}
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
                  placeholder="Search vendors..."
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
                    Status:
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Category:
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent text-sm"
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setStatusFilter("");
                    setCategoryFilter("");
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

            {selectedVendors && Object.keys(selectedVendors).length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {Object.keys(selectedVendors).length} selected
                </span>
                <button
                  onClick={() => setSelectedVendors({})}
                  className="text-sm text-[#90323d] hover:text-[#5e0b15] font-medium"
                >
                  Clear
                </button>
              </div>
            )}

            <button
              onClick={exportToCSV}
              className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Export"
            >
              <FaDownload className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

        {/* Vendors Grid */}
        {vendors.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 rounded-full bg-gray-100 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FaStore className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No vendors yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by adding your first vendor to begin tracking compliance
            </p>
            <Link
              to="/vendors/add"
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <FaPlus className="w-5 h-5" />
              Add First Vendor
            </Link>
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
        {vendors.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )} of {table.getFilteredRowModel().rows.length} vendors
              </div>

              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#90323d] focus:border-transparent"
              >
                {[10, 20, 30, 50].map(pageSize => (
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
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && vendorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Vendor</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{vendorToDelete.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorsList;