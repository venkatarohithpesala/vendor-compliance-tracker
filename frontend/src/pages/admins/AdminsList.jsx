import { useState, useEffect } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaBuilding, FaUser, FaExclamationTriangle, FaLink, FaUnlink, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import API from '../../api/api';
import { showToast } from '../../utils/toast';

function AdminsList() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [adminToAssign, setAdminToAssign] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await API.get('/users/admins');
      setAdmins(response.data.admins);
      setError(null);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to load admins';
      setError(msg);
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (admin) => { setAdminToDelete(admin); setShowDeleteModal(true); };

  const handleAssignClick = async (admin) => {
    setAdminToAssign(admin);
    setShowAssignModal(true);
    setSearchTerm('');
    setSelectedCompany(null);
    if (companies.length === 0) {
      try {
        const response = await API.get('/companies');
        setCompanies(response.data.companies);
      } catch { showToast.error('Failed to load companies'); }
    }
  };

  const handleAssignCompany = async (companyId) => {
    if (!adminToAssign) return;
    setAssignLoading(true);
    try {
      await API.put(`/users/admins/${adminToAssign.id}`, { companyId: companyId || null });
      setAdmins(prev => prev.map(a =>
        a.id === adminToAssign.id
          ? { ...a, companyId, companyName: companyId ? companies.find(c => c.id === companyId)?.name || null : null }
          : a
      ));
      showToast.success(companyId ? 'Admin assigned to company!' : 'Admin unassigned from company!');
      setShowAssignModal(false);
      setAdminToAssign(null);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to update admin assignment');
    } finally {
      setAssignLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;
    try {
      await API.delete(`/users/admins/${adminToDelete.id}`);
      showToast.success('Admin deleted successfully');
      setAdmins(prev => prev.filter(a => a.id !== adminToDelete.id));
      setShowDeleteModal(false);
      setAdminToDelete(null);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to delete admin');
    }
  };

  const filteredCompanies = companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" style={{ fontFamily: "var(--font-sidebar)" }}>
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-t-transparent" style={{ borderColor: "var(--color-primary)" }}></div>
        <span className="ml-3 text-sm" style={{ color: "var(--color-muted)" }}>Loading admins...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12" style={{ fontFamily: "var(--font-sidebar)" }}>
        <p className="text-base font-medium mb-1" style={{ color: "var(--color-text)" }}>Error loading admins</p>
        <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>{error}</p>
        <button
          onClick={fetchAdmins}
          className="px-4 py-2 text-white text-sm rounded-lg transition-colors"
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
    <div className="max-w-7xl mx-auto" style={{ fontFamily: "var(--font-sidebar)" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: "rgba(var(--color-primary-rgb), 0.12)", color: "var(--color-primary)" }}>
            <FaUser className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>Admins</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>Manage admin users in the system</p>
          </div>
        </div>
        {admins.length > 0 && (
          <Link
            to="/admins/add"
            className="inline-flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg transition-all duration-200 text-sm"
            style={{ backgroundColor: "var(--color-primary-hover)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#6a7a5f"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
          >
            <FaUserPlus className="w-3.5 h-3.5" />
            Add Admin
          </Link>
        )}
      </div>

      {/* Stats — only when data exists */}
      {admins.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Admins", value: admins.length, icon: <FaUser className="w-4 h-4" />, iconBg: "rgba(var(--color-primary-rgb), 0.15)", iconColor: "#4f5c48" },
            { label: "Assigned", value: admins.filter(a => a.companyId).length, icon: <FaBuilding className="w-4 h-4" />, iconBg: "rgba(var(--color-primary-rgb), 0.25)", iconColor: "#3a4e34" },
            { label: "Unassigned", value: admins.filter(a => !a.companyId).length, icon: <FaUserPlus className="w-4 h-4" />, iconBg: "rgba(var(--color-primary-rgb), 0.07)", iconColor: "var(--color-muted)" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: card.iconBg, color: card.iconColor }}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>{card.label}</p>
                <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--color-text)" }}>{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {admins.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: "rgba(var(--color-primary-rgb), 0.10)" }}>
              <FaUser className="w-7 h-7" style={{ color: "var(--color-primary)" }} />
            </div>
            <h3 className="text-base font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>No admins yet</h3>
            <p className="text-sm mb-7 max-w-sm mx-auto" style={{ color: "var(--color-muted)" }}>
              Get started by creating your first admin user to manage companies
            </p>
            <Link
              to="/admins/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-medium rounded-xl transition-all duration-200 text-sm"
              style={{ backgroundColor: "var(--color-primary-hover)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#6a7a5f"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
            >
              <FaUserPlus className="w-3.5 h-3.5" />
              Create First Admin
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontFamily: "var(--font-sidebar)" }}>
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-muted)", borderBottom: "1px solid var(--color-border)" }}>
                  {["Admin", "Company", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-6 pb-3 pt-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                {admins.map((admin, i) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: i < admins.length - 1 ? "1px solid var(--color-border)" : "none" }}
                  >
                    {/* Admin name/email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                          style={{ backgroundColor: "rgba(var(--color-primary-rgb), 0.12)", color: "var(--color-primary)" }}
                        >
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold" style={{ color: "#1a2318" }}>{admin.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{admin.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.companyName ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: "rgba(var(--color-primary-rgb), 0.12)",
                            color: "#3a4e34",
                            border: "1px solid rgba(var(--color-primary-rgb), 0.25)",
                          }}
                        >
                          <FaBuilding className="w-3 h-3" />
                          {admin.companyName}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--color-border)" }}>—</span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "#374151" }}>
                      {formatDate(admin.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAssignClick(admin)}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: "var(--color-primary)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(var(--color-primary-rgb), 0.10)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                          title={admin.companyId ? 'Unassign from Company' : 'Assign to Company'}
                        >
                          {admin.companyId ? <FaUnlink className="w-3.5 h-3.5" /> : <FaLink className="w-3.5 h-3.5" />}
                        </button>

                        <Link
                          to={`/admins/edit/${admin.id}`}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: "#374151" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                          title="Edit Admin"
                        >
                          <FaEdit className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDeleteClick(admin)}
                          className="p-2 rounded-lg transition-all duration-150 text-red-500"
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                          title="Delete Admin"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Modal ── */}
      {showDeleteModal && adminToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            style={{ boxShadow: "0 16px 48px rgba(31,41,55,0.18)", fontFamily: "var(--font-sidebar)" }}
          >
            <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--color-border)", borderLeft: "4px solid #ef4444" }}>
              <h3 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>Delete Admin</h3>
              <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>This action cannot be undone</p>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm" style={{ color: "var(--color-text)" }}>
                Are you sure you want to delete <strong>{adminToDelete.name}</strong>?
              </p>
              {adminToDelete.companyName && (
                <div className="rounded-xl p-3.5 flex items-start gap-2.5 text-sm" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                  <FaExclamationTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                  <p style={{ color: "#92400e" }}>
                    This admin is assigned to <strong>{adminToDelete.companyName}</strong>. Please unassign them first.
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{ color: "var(--color-muted)", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-page-bg)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface)"; }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={!!adminToDelete.companyName}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Delete Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Modal ── */}
      {showAssignModal && adminToAssign && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden"
            style={{ boxShadow: "0 16px 48px rgba(31,41,55,0.18)", fontFamily: "var(--font-sidebar)" }}
          >
            {/* Modal header */}
            <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--color-border)", borderLeft: "4px solid var(--color-primary)" }}>
              <h3 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                {adminToAssign.companyId ? 'Unassign' : 'Assign'} Admin to Company
              </h3>
              <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>{adminToAssign.name} · {adminToAssign.email}</p>
            </div>

            <div className="p-6 space-y-4">
              {adminToAssign.companyId ? (
                // Unassign
                <div className="rounded-xl p-4 flex items-start gap-3 text-sm" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                  <FaExclamationTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                  <p style={{ color: "#92400e" }}>
                    Unassign <strong>{adminToAssign.name}</strong> from <strong>{adminToAssign.companyName}</strong>?
                  </p>
                </div>
              ) : (
                <>
                  {/* Search */}
                  <div className="relative">
                    <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-muted)" }} />
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-xl outline-none text-sm"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-page-bg)", color: "var(--color-text)", fontFamily: "var(--font-sidebar)" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(140,155,130,0.15)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>

                  {/* Company list */}
                  <div className="max-h-64 overflow-y-auto rounded-xl border" style={{ borderColor: "var(--color-border)" }}>
                    {searchTerm === '' ? (
                      <div className="text-center py-10 text-sm" style={{ color: "var(--color-muted)" }}>
                        Start typing to search companies
                      </div>
                    ) : filteredCompanies.length === 0 ? (
                      <div className="text-center py-10 text-sm" style={{ color: "var(--color-muted)" }}>
                        No companies found for "{searchTerm}"
                      </div>
                    ) : (
                      filteredCompanies.map((company, i) => (
                        <div
                          key={company.id}
                          onClick={() => setSelectedCompany(company)}
                          className="px-4 py-3 flex items-center justify-between cursor-pointer transition-colors"
                          style={{
                            borderBottom: i < filteredCompanies.length - 1 ? "1px solid var(--color-border)" : "none",
                            backgroundColor: selectedCompany?.id === company.id ? "rgba(var(--color-primary-rgb), 0.08)" : "transparent",
                            borderLeft: selectedCompany?.id === company.id ? "3px solid var(--color-primary)" : "3px solid transparent",
                          }}
                          onMouseEnter={(e) => { if (selectedCompany?.id !== company.id) e.currentTarget.style.backgroundColor = "var(--color-page-bg)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = selectedCompany?.id === company.id ? "rgba(var(--color-primary-rgb), 0.08)" : "transparent"; }}
                        >
                          <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{company.name}</span>
                          {selectedCompany?.id === company.id && (
                            <FaCheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: "1px solid var(--color-border)", backgroundColor: "var(--color-page-bg)" }}>
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: "var(--color-muted)", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-page-bg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface)"; }}
              >
                Cancel
              </button>
              {adminToAssign.companyId ? (
                <button
                  onClick={() => handleAssignCompany(null)}
                  disabled={assignLoading}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                  style={{ backgroundColor: "#f59e0b" }}
                  onMouseEnter={(e) => { if (!assignLoading) e.currentTarget.style.backgroundColor = "#d97706"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f59e0b"; }}
                >
                  {assignLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <FaUnlink className="w-3.5 h-3.5" />}
                  Unassign Admin
                </button>
              ) : (
                <button
                  onClick={() => { if (selectedCompany) handleAssignCompany(selectedCompany.id); }}
                  disabled={assignLoading || !selectedCompany}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                  style={{ backgroundColor: "var(--color-primary)" }}
                  onMouseEnter={(e) => { if (!assignLoading && selectedCompany) e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
                >
                  {assignLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <FaLink className="w-3.5 h-3.5" />}
                  Assign Admin
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminsList;
