import { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import API from "../../api/api";
import { showToast } from "../../utils/toast";

function VendorsList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = [
    {
      accessorKey: "name",
      header: "Vendor",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
            <FaStore className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
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
      header: "Category",
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
      header: "Status",
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
      header: "Created",
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
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 hover:bg-[#90323d]/5 text-[#90323d] hover:text-[#5e0b15] font-medium rounded-lg transition-all duration-200 border border-gray-200 hover:border-[#90323d]/20">
            <FaEye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => handleDeleteVendor(row.original.id, row.original.name)}
            className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-medium rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
          >
            <FaTrash className="w-4 h-4" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: vendors,
    columns,
    getCoreRowModel: getCoreRowModel(),
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

  const handleDeleteVendor = async (vendorId, vendorName) => {
    if (!window.confirm(`Are you sure you want to delete "${vendorName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await API.delete(`/vendors/${vendorId}`);
      setVendors((prev) => prev.filter((vendor) => vendor.id !== vendorId));
      showToast.success("Vendor deleted successfully");
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

      {/* Vendors Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
      </div>
    </div>
  );
}

export default VendorsList;