import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import Sidebar from './Sidebar';

function Layout({ children, title = "Dashboard", user, setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state and redirect, even if API call fails
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--color-page-bg)", fontFamily: "var(--font-app)" }}>
      {/* Sidebar */}
      {user?.role && <Sidebar role={user.role} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <nav className="shadow-sm" style={{ backgroundColor: "var(--color-topbar-bg)", borderBottom: "1px solid var(--color-topbar-border)" }}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-1">
                <h1 className="text-xl font-semibold" style={{ color: "var(--color-topbar-title)" }}>{title}</h1>
              </div>

              {/* Right side items */}
              <div className="flex items-center gap-6">
                {/* Notifications */}
                <button className="transition-colors" style={{ color: "var(--color-muted)" }}>
                  <FaBell className="h-6 w-6" />
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-primary)" }}>
                    <span className="text-white font-medium">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{user?.name}</p>
                    <p className="text-xs capitalize" style={{ color: "var(--color-muted)" }}>{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-4 px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors duration-200"
                    style={{ backgroundColor: "var(--color-primary)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
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
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;