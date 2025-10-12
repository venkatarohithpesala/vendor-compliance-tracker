import { useNavigate } from 'react-router-dom';
import { FaBell, FaSearch } from 'react-icons/fa';
import { showToast } from '../utils/toast';
import Sidebar from '../components/Sidebar';

function Home({ user, setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    showToast.info('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar role={user?.role || 'admin'} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <nav className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-[#5e0b15]">Welcome to VenTrack</h1>
              </div>

              {/* Right side items */}
              <div className="flex items-center gap-6">
                {/* Notifications */}
                <button className="text-gray-500 hover:text-gray-700">
                  <FaBell className="h-6 w-6" />
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#5e0b15] flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-4 px-4 py-2 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-[#90323d] to-[#5e0b15] hover:shadow-lg transition-shadow duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h1 className="text-2xl font-bold text-[#5e0b15]">Welcome to Dashboard</h1>
              <p className="mt-2 text-gray-600">Select an option from the sidebar to get started</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;