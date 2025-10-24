import { FaBars } from 'react-icons/fa';
import Sidebar from './Sidebar';

function Layout({ children, title = "Dashboard" }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar role="super_admin" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <nav className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-[#5e0b15]">{title}</h1>
              </div>

              {/* Right side items */}
              <div className="flex items-center gap-6">
                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#5e0b15] flex items-center justify-center">
                    <span className="text-white font-medium">
                      S
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-700">Super Admin</p>
                    <p className="text-xs text-gray-500 capitalize">super_admin</p>
                  </div>
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