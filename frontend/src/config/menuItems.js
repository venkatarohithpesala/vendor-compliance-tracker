import { 
  FaChartPie, 
  FaUsers, 
  FaFileAlt, 
  FaUserCog, 
  FaChartBar, 
  FaCog, 
  FaUser,
  FaFileUpload,
  FaBell
} from 'react-icons/fa';

export const menuItems = {
  admin: [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: FaChartPie
    },
    {
      title: 'Vendors',
      icon: FaUsers,
      children: [
        { title: 'All Vendors', path: '/vendors' },
        { title: 'Add Vendor', path: '/vendors/add' },
        { title: 'Compliance Status', path: '/vendors/compliance' }
      ]
    },
    {
      title: 'Documents',
      icon: FaFileAlt,
      children: [
        { title: 'All Documents', path: '/documents' },
        { title: 'Document Types', path: '/documents/types' },
        { title: 'Expiry Tracking', path: '/documents/expiry' }
      ]
    },
    {
      title: 'Users',
      icon: FaUserCog,
      children: [
        { title: 'All Users', path: '/users' },
        { title: 'Add User', path: '/users/add' },
        { title: 'Roles', path: '/users/roles' }
      ]
    },
    {
      title: 'Reports & Analytics',
      path: '/reports',
      icon: FaChartBar
    },
    {
      title: 'Settings',
      icon: FaCog,
      children: [
        { title: 'Company Profile', path: '/settings/company' },
        { title: 'Email Templates', path: '/settings/email' },
        { title: 'System Settings', path: '/settings/system' }
      ]
    }
  ],
  staff: [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: FaChartPie
    },
    {
      title: 'Vendors',
      icon: FaUsers,
      children: [
        { title: 'View Vendors', path: '/vendors' },
        { title: 'Compliance Status', path: '/vendors/compliance' }
      ]
    },
    {
      title: 'Documents',
      icon: FaFileAlt,
      children: [
        { title: 'View Documents', path: '/documents' },
        { title: 'Track Expiry', path: '/documents/expiry' }
      ]
    },
    {
      title: 'Reports',
      icon: FaChartBar,
      children: [
        { title: 'Basic Reports', path: '/reports/basic' },
        { title: 'Compliance Reports', path: '/reports/compliance' }
      ]
    }
  ],
  vendor: [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: FaChartPie
    },
    {
      title: 'My Documents',
      icon: FaFileUpload,
      children: [
        { title: 'Upload Documents', path: '/documents/upload' },
        { title: 'View Documents', path: '/documents' },
        { title: 'Expiry Status', path: '/documents/expiry' }
      ]
    },
    {
      title: 'My Profile',
      path: '/profile',
      icon: FaUser
    },
    {
      title: 'Notifications',
      path: '/notifications',
      icon: FaBell
    }
  ]
};