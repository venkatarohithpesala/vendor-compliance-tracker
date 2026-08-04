import { useState, useEffect } from "react";
import {
  FaBuilding,
  FaGlobe,
  FaEye,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const columns = [
    {
      accessorKey: "name",
      header: "Company",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
            style={{
              backgroundColor: "rgba(var(--color-primary-rgb), 0.12)",
              color: "var(--color-primary)",
              fontFamily: "var(--font-sidebar)",
            }}
          >
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-sm" style={{ color: "#1a2318", fontFamily: "var(--font-sidebar)" }}>
            {row.original.name}
          </span>
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
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "var(--color-primary)", fontFamily: "var(--font-sidebar)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-primary)"; }}
          >
            <FaGlobe className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate max-w-[180px]">
              {row.original.website.replace(/^https?:\/\//, "")}
            </span>
          </a>
        ) : (
          <span className="text-sm" style={{ color: "var(--color-border)" }}>—</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.status === "active";
        return (
          <button
            onClick={() => toggleCompanyStatus(row.original.id, row.original.status)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              backgroundColor: isActive ? "rgba(var(--color-primary-rgb), 0.15)" : "rgba(107,114,128,0.10)",
              color: isActive ? "#3a4e34" : "#6b7280",
              fontFamily: "var(--font-sidebar)",
              border: `1px solid ${isActive ? "var(--color-primary)" : "rgba(107,114,128,0.25)"}`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: isActive ? "var(--color-primary)" : "#9ca3af" }}
            />
            {isActive ? "Active" : "Inactive"}
          </button>
        );
      },
    },
    {
      accessorKey: "createdByEmail",
      header: "Created By",
      cell: ({ row }) => (
        <span className="text-sm" style={{ color: "#374151", fontFamily: "var(--font-sidebar)" }}>
          {row.original.createdByEmail}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm" style={{ color: "#374151", fontFamily: "var(--font-sidebar)" }}>
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
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/companies/${row.original.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
          style={{
            color: "var(--color-primary)",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            fontFamily: "var(--font-sidebar)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(var(--color-primary-rgb), 0.08)";
            e.currentTarget.style.borderColor = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-surface)";
            e.currentTarget.style.borderColor = "var(--color-border)";
          }}
        >
          <FaEye className="w-3.5 h-3.5" />
          View
        </button>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--color-primary)" }}></div>
        <span className="ml-2" style={{ color: "var(--color-muted)" }}>Loading companies...</span>
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
          className="px-4 py-2 text-white rounded-lg transition-colors"
          style={{ backgroundColor: "var(--color-primary)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8" style={{ fontFamily: "var(--font-sidebar)" }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: "rgba(var(--color-primary-rgb), 0.12)", color: "var(--color-primary)" }}>
            <FaBuilding className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>Companies</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
              Manage all companies in the system
            </p>
          </div>
        </div>

        {companies.length > 0 && (
          <Link
            to="/companies/add"
            className="inline-flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg transition-all duration-200"
            style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-sidebar)", fontSize: "0.875rem" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
          >
            <FaPlus className="w-3.5 h-3.5" />
            Add Company
          </Link>
        )}
      </div>

      {/* Stats Cards — only shown when data exists */}
      {companies.length > 0 && <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" style={{ fontFamily: "var(--font-sidebar)" }}>
        {[
          {
            label: "Total Companies",
            value: companies.length,
            icon: <FaBuilding className="w-4 h-4" />,
            iconBg: "var(--color-stat-icon-bg)",
            iconColor: "var(--color-stat-icon)",
          },
          {
            label: "Active",
            value: companies.filter((c) => c.status === "active").length,
            icon: <FaCheckCircle className="w-4 h-4" />,
            iconBg: "var(--color-stat-icon-bg-soft)",
            iconColor: "var(--color-stat-icon-soft)",
          },
          {
            label: "Inactive",
            value: companies.filter((c) => c.status === "inactive").length,
            icon: <FaTimesCircle className="w-4 h-4" />,
            iconBg: "var(--color-stat-icon-bg-muted)",
            iconColor: "var(--color-stat-icon-muted)",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl shadow-sm border p-5 flex items-center gap-4"
            style={{
              borderColor: "var(--color-stat-card-border)",
            }}
          >
            <div
              className="p-3 rounded-xl flex-shrink-0"
              style={{ backgroundColor: card.iconBg, color: card.iconColor }}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                {card.label}
              </p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--color-text)" }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>}

      {/* Companies Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {companies.length === 0 ? (
          <div className="text-center py-16" style={{ fontFamily: "var(--font-sidebar)" }}>
            <div className="p-4 rounded-full w-16 h-16 mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: "rgba(var(--color-primary-rgb), 0.10)" }}>
              <FaBuilding className="w-8 h-8" style={{ color: "var(--color-primary)" }} />
            </div>
            <h3 className="text-lg font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>
              No companies yet
            </h3>
            <p className="text-sm mb-7 max-w-sm mx-auto" style={{ color: "var(--color-muted)" }}>
              Get started by creating your first company to begin managing vendor compliance
            </p>
            <Link
              to="/companies/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-medium rounded-xl transition-all duration-200"
              style={{ backgroundColor: "var(--color-primary)", fontSize: "0.875rem" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
            >
              <FaPlus className="w-3.5 h-3.5" />
              Create First Company
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontFamily: "var(--font-sidebar)" }}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-muted)", borderBottom: "1px solid var(--color-border)" }}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-6 pb-3 pt-5">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="text-sm">
                {table.getRowModel().rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: i < table.getRowModel().rows.length - 1 ? "1px solid var(--color-border)" : "none" }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

export default CompaniesList;
