import { useState, useEffect } from "react";
import {
  FaBuilding,
  FaGlobe,
  FaEye,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import API from "../../api/api";
import { showToast } from "../../utils/toast";

function CompaniesList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [availableAdmins, setAvailableAdmins] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);


  const columns = [
    {
      accessorKey: "name",
      header: "Company",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
            <FaBuilding className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
            <div className="text-sm text-gray-500">ID: {row.original.id}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "website",
      header: "Website",
      cell: ({ row }) =>
        row.original.website ? (
          <a
            href={row.original.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            <FaGlobe className="w-4 h-4" />
            {row.original.website.replace(/^https?:\/\//, "")}
          </a>
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
            onClick={() => toggleCompanyStatus(row.original.id, row.original.status)}
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
      accessorKey: "createdByEmail",
      header: "Created By",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.createdByEmail}
        </span>
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
            onClick={() => openAssignModal(row.original)}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 font-medium rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
          >
            <FaPlus className="w-4 h-4" />
            Assign Admin
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: companies,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await API.get("/companies");
      setCompanies(response.data.companies);
      setError(null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load companies";
      setError(errorMessage);
      showToast.error(errorMessage);
      console.error("Fetch companies error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompanyStatus = async (companyId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const response = await API.put(`/companies/${companyId}/status`, {
        status: newStatus,
      });
      // Update the local state
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === companyId
            ? { ...company, status: newStatus }
            : company
        )
      );
      showToast.success(`Company status updated to ${newStatus}`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update company status";
      showToast.error(errorMessage);
      console.error("Toggle status error:", error);
    }
  };

  const openAssignModal = async (company) => {
    setSelectedCompany(company);
    setSelectedAdminId("");
    setShowAssignModal(true);
    // Fetch available admins
    try {
      const response = await API.get("/companies/available-admins");
      setAvailableAdmins(response.data.admins);
    } catch (error) {
      showToast.error("Failed to load available admins");
      console.error("Fetch admins error:", error);
    }
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedCompany(null);
    setAvailableAdmins([]);
    setSelectedAdminId("");
  };

  const assignAdmin = async () => {
    if (!selectedAdminId) {
      showToast.error("Please select an admin");
      return;
    }
    setAssignLoading(true);
    try {
      const response = await API.put(`/companies/${selectedCompany.id}/assign-admin`, {
        adminId: selectedAdminId,
      });
      showToast.success("Admin assigned successfully");
      closeAssignModal();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to assign admin";
      showToast.error(errorMessage);
      console.error("Assign admin error:", error);
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#90323d]"></div>
        <span className="ml-2 text-gray-600">Loading companies...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <FaTimesCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error Loading Companies</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={fetchCompanies}
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
            <FaBuilding className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#5e0b15]">Companies</h1>
            <p className="text-gray-600 mt-1">
              Manage all companies in the system
            </p>
          </div>
        </div>

        <Link
          to="/companies/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <FaPlus className="w-4 h-4" />
          Add Company
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FaBuilding className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Companies
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.length}
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
                Active Companies
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.filter((c) => c.status === "active").length}
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
                Inactive Companies
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.filter((c) => c.status === "inactive").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {companies.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 rounded-full bg-gray-100 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FaBuilding className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No companies yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating your first company to begin managing
              vendor compliance
            </p>
            <Link
              to="/companies/add"
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <FaPlus className="w-5 h-5" />
              Create First Company
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

      {/* Assign Admin Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Admin to {selectedCompany?.name}
              </h3>
              <button
                onClick={closeAssignModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Admin
              </label>
              <select
                value={selectedAdminId}
                onChange={(e) => setSelectedAdminId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent"
              >
                <option value="">Choose an admin...</option>
                {availableAdmins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} ({admin.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeAssignModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={assignAdmin}
                disabled={assignLoading || !selectedAdminId}
                className="px-4 py-2 bg-[#90323d] text-white font-medium rounded-lg hover:bg-[#5e0b15] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {assignLoading ? "Assigning..." : "Assign Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompaniesList;
