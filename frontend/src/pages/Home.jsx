import { showToast } from '../utils/toast';

function Home({ user }) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-[#5e0b15]">Welcome to Dashboard</h1>
        <p className="mt-2 text-gray-600">Select an option from the sidebar to get started</p>
        
        {/* Quick Stats or Welcome Content */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-[#90323d] to-[#5e0b15] rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Welcome back, {user?.name}!</h3>
            <p className="text-sm opacity-90">You are logged in as {user?.role}</p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Actions</h3>
            <p className="text-sm text-blue-700">Use the sidebar to manage companies and admins</p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-2">System Status</h3>
            <p className="text-sm text-green-700">All systems operational</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;