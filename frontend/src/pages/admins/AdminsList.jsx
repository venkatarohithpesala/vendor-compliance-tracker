import { useState, useEffect } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaBuilding, FaUser, FaExclamationTriangle, FaLink, FaUnlink } from 'react-icons/fa';
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

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await API.get('/users/admins');
      setAdmins(response.data.admins);
      setError(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load admins';
      setError(errorMessage);
      showToast.error(errorMessage);
      console.error('Fetch admins error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (admin) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  const handleAssignClick = async (admin) => {
    setAdminToAssign(admin);
    setShowAssignModal(true);
    setSearchTerm('');
    setSelectedCompany(null);

    // Fetch companies if not already loaded
    if (companies.length === 0) {
      try {
        const response = await API.get('/companies');
        setCompanies(response.data.companies);
      } catch (error) {
        console.error('Error fetching companies:', error);
        showToast.error('Failed to load companies');
      }
    }
  };

  const handleAssignCompany = async (companyId) => {
    if (!adminToAssign) return;

    setAssignLoading(true);
    try {
      await API.put(`/users/admins/${adminToAssign.id}`, {
        companyId: companyId || null
      });

      // Update the admin in the local state
      setAdmins(prev => prev.map(admin =>
        admin.id === adminToAssign.id
          ? {
              ...admin,
              companyId: companyId,
              companyName: companyId
                ? companies.find(c => c.id === companyId)?.name || null
                : null
            }
          : admin
      ));

      showToast.success(
        companyId
          ? 'Admin assigned to company successfully!'
          : 'Admin unassigned from company successfully!'
      );

      setShowAssignModal(false);
      setAdminToAssign(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update admin assignment';
      showToast.error(errorMessage);
      console.error('Assign company error:', error);
    } finally {
      setAssignLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;

    try {
      await API.delete(`/users/admins/${adminToDelete.id}`);
      showToast.success('Admin deleted successfully');
      setAdmins(prev => prev.filter(admin => admin.id !== adminToDelete.id));
      setShowDeleteModal(false);
      setAdminToDelete(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete admin';
      showToast.error(errorMessage);
      console.error('Delete admin error:', error);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#90323d]"></div>
        <span className="ml-2 text-gray-600">Loading admins...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <FaTrash className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error Loading Admins</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={fetchAdmins}
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
            <FaUser className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#5e0b15]">Admins</h1>
            <p className="text-gray-600 mt-1">Manage admin users in the system</p>
          </div>
        </div>

        <Link
          to="/admins/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <FaUserPlus className="w-4 h-4" />
          Add Admin
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FaUser className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <FaBuilding className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned to Companies</p>
              <p className="text-2xl font-bold text-gray-900">
                {admins.filter(a => a.companyId).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <FaUserPlus className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Unassigned</p>
              <p className="text-2xl font-bold text-gray-900">
                {admins.filter(a => !a.companyId).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {admins.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 rounded-full bg-gray-100 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FaUser className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No admins yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating your first admin user to manage companies
            </p>
            <Link
              to="/admins/add"
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <FaUserPlus className="w-5 h-5" />
              Create First Admin
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
                          <FaUser className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.companyName ? (
                        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaBuilding className="w-3 h-3" />
                          {admin.companyName}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(admin.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAssignClick(admin)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            admin.companyId
                              ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          }`}
                          title={admin.companyId ? 'Unassign from Company' : 'Assign to Company'}
                        >
                          {admin.companyId ? (
                            <FaUnlink className="w-4 h-4" />
                          ) : (
                            <FaLink className="w-4 h-4" />
                          )}
                        </button>

                        <Link
                          to={`/admins/edit/${admin.id}`}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit Admin"
                        >
                          <FaEdit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDeleteClick(admin)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete Admin"
                        >
                          <FaTrash className="w-4 h-4" />
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && adminToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Admin</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{adminToDelete.name}</strong>?
              This action cannot be undone.
            </p>

            {adminToDelete.companyName && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    This admin is assigned to <strong>{adminToDelete.companyName}</strong>.
                    Please unassign them from the company first.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={!!adminToDelete.companyName}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Delete Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Company Modal */}
      {showAssignModal && adminToAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {adminToAssign.companyId ? 'Unassign' : 'Assign'} Admin to Company
              </h3>
            </div>

            <div className="p-6">
              {/* Admin Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#90323d] to-[#5e0b15] text-white">
                    <FaUser className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{adminToAssign.name}</p>
                    <p className="text-sm text-gray-600">{adminToAssign.email}</p>
                  </div>
                </div>
                {adminToAssign.companyId && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Currently assigned to:</span>
                    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaBuilding className="w-3 h-3" />
                      {adminToAssign.companyName}
                    </span>
                  </div>
                )}
              </div>

              {adminToAssign.companyId ? (
                // Unassign confirmation
                <div className="text-center py-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                    <FaExclamationTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-yellow-800 mb-2">Unassign Admin</h4>
                    <p className="text-yellow-700">
                      Are you sure you want to unassign <strong>{adminToAssign.name}</strong> from{' '}
                      <strong>{adminToAssign.companyName}</strong>?
                    </p>
                  </div>
                </div>
              ) : (
                // Company selection
                <div>
                  {/* Search Bar */}
                  <div className="mb-4">
                    <div className="relative">
                      <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90323d] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Companies List */}
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    {searchTerm === '' ? (
                      <div className="text-center py-12">
                        <FaBuilding className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-600 mb-2">Search for Companies</h4>
                        <p className="text-gray-500">
                          Start typing above to find and assign a company to this admin
                        </p>
                      </div>
                    ) : filteredCompanies.length === 0 ? (
                      <div className="text-center py-8">
                        <FaBuilding className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No companies found matching "{searchTerm}"
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredCompanies.map((company) => (
                          <div
                            key={company.id}
                            onClick={() => setSelectedCompany(company)}
                            className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                              selectedCompany?.id === company.id ? 'bg-[#90323d] bg-opacity-10 border-l-4 border-[#90323d]' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                  <FaBuilding className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{company.name}</h4>
                                  <p className="text-sm text-gray-600">ID: {company.id}</p>
                                </div>
                              </div>
                              {selectedCompany?.id === company.id && (
                                <div className="text-[#90323d]">
                                  <FaLink className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Company Preview */}
                  {selectedCompany && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Company Preview</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-700">
                            <strong>Name:</strong> {selectedCompany.name}
                          </p>
                          <p className="text-sm text-blue-700">
                            <strong>ID:</strong> {selectedCompany.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">
                            <strong>Created:</strong> {formatDate(selectedCompany.createdAt)}
                          </p>
                          <p className="text-sm text-blue-700">
                            <strong>Status:</strong> Active
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              {adminToAssign.companyId ? (
                <button
                  onClick={() => handleAssignCompany(null)}
                  disabled={assignLoading}
                  className="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {assignLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Unassigning...
                    </>
                  ) : (
                    <>
                      <FaUnlink className="w-4 h-4" />
                      Unassign Admin
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (selectedCompany) {
                      handleAssignCompany(selectedCompany.id);
                    }
                  }}
                  disabled={assignLoading || !selectedCompany}
                  className="px-6 py-2 bg-[#90323d] text-white font-medium rounded-lg hover:bg-[#5e0b15] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {assignLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <FaLink className="w-4 h-4" />
                      Assign Admin
                    </>
                  )}
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