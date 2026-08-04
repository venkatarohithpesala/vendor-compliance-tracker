import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTag,
  FaCalendarAlt,
  FaClock,
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

function ComplianceRequirements() {
  const [requirements, setRequirements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requirementToDelete, setRequirementToDelete] = useState(null);

  // Filters and search
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [frequencyFilter, setFrequencyFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const columns = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-100 px-2 py-1 rounded"
          onClick={column.getToggleSortingHandler()}
        >
          Requirement
          {column.getIsSorted() === "asc" && <FaSortUp className="w-3 h-3" />}
          {column.getIsSorted() === "desc" && <FaSortDown className="w-3 h-3" />}
          {!column.getIsSorted() && <FaSort className="w-3 h-3 opacity-50" />}
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
            <FaShieldAlt className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
            <div className="text-sm text-gray-500 max-w-xs truncate">
              {row.original.description || "No description"}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FaTag className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{row.original.category?.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "frequency",
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-100 px-2 py-1 rounded"
          onClick={column.getToggleSortingHandler()}
        >
          Frequency
          {column.getIsSorted() === "asc" && <FaSortUp className="w-3 h-3" />}
          {column.getIsSorted() === "desc" && <FaSortDown className="w-3 h-3" />}
          {!column.getIsSorted() && <FaSort className="w-3 h-3 opacity-50" />}
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FaClock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700 capitalize">
            {row.original.frequency.replace('-', ' ')}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "defaultDueDate",
      header: "Default Due Date",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">
            {row.original.defaultDueDate
              ? new Date(row.original.defaultDueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "Not set"
            }
          </span>
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
          <Link
            to={`/compliance/requirements/edit/${row.original.id}`}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Edit Requirement"
          >
            <FaEdit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleDeleteClick(row.original)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete Requirement"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = requirements;

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(req => req.category?.id === parseInt(categoryFilter));
    }

    // Apply frequency filter
    if (frequencyFilter) {
      filtered = filtered.filter(req => req.frequency === frequencyFilter);
    }

    return filtered;
  }, [requirements, categoryFilter, frequencyFilter]);

  // Get unique frequencies for filter dropdown
  const uniqueFrequencies = useMemo(() => {
    const frequencies = [...new Set(requirements.map(r => r.frequency))];
    return frequencies.sort();
  }, [requirements]);

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
    fetchRequirements();
    fetchCategories();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const response = await API.get("/compliance/requirements");
      setRequirements(response.data.requirements);
      setError(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to load compliance requirements";
      setError(errorMessage);
      showToast.error(errorMessage);
      console.error("Fetch requirements error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get("/compliance/categories");
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDeleteClick = (requirement) => {
    setRequirementToDelete(requirement);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!requirementToDelete) return;

    try {
      await API.delete(`/compliance/requirements/${requirementToDelete.id}`);
      setRequirements((prev) => prev.filter((req) => req.id !== requirementToDelete.id));
      showToast.success("Compliance requirement deleted successfully");
      setShowDeleteModal(false);
      setRequirementToDelete(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete requirement";
      showToast.error(errorMessage);
      console.error("Delete requirement error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#90323d]"></div>
        <span className="ml-2 text-gray-600">Loading compliance requirements...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <FaTrash className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error Loading Requirements</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={fetchRequirements}
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
            <FaShieldAlt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#5e0b15]">Compliance Requirements</h1>
            <p className="text-gray-600 mt-1">
              Manage compliance requirements and categories
            </p>
          </div>
        </div>

        <Link
          to="/compliance/requirements/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <FaPlus className="w-4 h-4" />
          Add Requirement
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FaShieldAlt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Requirements
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {requirements.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <FaCalendarAlt className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Annual Requirements
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {requirements.filter((r) => r.frequency === "annual").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <FaClock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Quarterly Requirements
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {requirements.filter((r) => r.frequency === "quarterly").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <FaTag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Categories
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.length}
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
                    placeholder="Search requirements..."
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
                      Category:
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent text-sm"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Frequency:
                    </label>
                    <select
                      value={frequencyFilter}
                      onChange={(e) => setFrequencyFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent text-sm"
                    >
                      <option value="">All Frequencies</option>
                      {uniqueFrequencies.map(frequency => (
                        <option key={frequency} value={frequency}>
                          {frequency.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setCategoryFilter("");
                      setFrequencyFilter("");
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

        {/* Requirements Table */}
        {requirements.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 rounded-full bg-gray-100 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FaShieldAlt className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No compliance requirements yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by adding your first compliance requirement to begin tracking vendor compliance
            </p>
            <Link
              to="/compliance/requirements/add"
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <FaPlus className="w-5 h-5" />
              Add First Requirement
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
        {requirements.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )} of {table.getFilteredRowModel().rows.length} requirements
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
      {showDeleteModal && requirementToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Compliance Requirement</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{requirementToDelete.name}</strong>?
              This action cannot be undone and may affect existing vendor compliance records.
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
                Delete Requirement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplianceRequirements;