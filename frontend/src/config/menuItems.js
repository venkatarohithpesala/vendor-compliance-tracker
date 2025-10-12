import {
  FaChartPie,
  FaUsers,
  FaFileAlt,
  FaUserCog,
  FaChartBar,
  FaCog,
  FaUser,
  FaFileUpload,
  FaBell,
  FaListAlt,
  FaUserPlus,
  FaClipboardCheck,
  FaFileContract,
  FaHourglassHalf,
  FaUserShield,
  FaEnvelopeOpenText,
  FaTools,
  FaBuilding,
} from "react-icons/fa";

export const menuItems = {
  admin: [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: FaChartPie,
    },
    {
      title: "Vendors",
      icon: FaUsers,
      children: [
        { title: "All Vendors", path: "/vendors", icon: FaListAlt },
        { title: "Add Vendor", path: "/vendors/add", icon: FaUserPlus },
        {
          title: "Compliance Status",
          path: "/vendors/compliance",
          icon: FaClipboardCheck,
        },
      ],
    },
    {
      title: "Documents",
      icon: FaFileAlt,
      children: [
        { title: "All Documents", path: "/documents", icon: FaFileAlt },
        {
          title: "Document Types",
          path: "/documents/types",
          icon: FaFileContract,
        },
        {
          title: "Expiry Tracking",
          path: "/documents/expiry",
          icon: FaHourglassHalf,
        },
      ],
    },
    {
      title: "Users",
      icon: FaUserCog,
      children: [
        { title: "All Users", path: "/users", icon: FaUsers },
        { title: "Add User", path: "/users/add", icon: FaUserPlus },
        { title: "Roles", path: "/users/roles", icon: FaUserShield },
      ],
    },
    {
      title: "Reports & Analytics",
      path: "/reports",
      icon: FaChartBar,
    },
    {
      title: "Settings",
      icon: FaCog,
      children: [
        {
          title: "Company Profile",
          path: "/settings/company",
          icon: FaBuilding,
        },
        {
          title: "Email Templates",
          path: "/settings/email",
          icon: FaEnvelopeOpenText,
        },
        { title: "System Settings", path: "/settings/system", icon: FaTools },
      ],
    },
  ],
  staff: [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: FaChartPie,
    },
    {
      title: "Vendors",
      icon: FaUsers,
      children: [
        { title: "View Vendors", path: "/vendors" },
        { title: "Compliance Status", path: "/vendors/compliance" },
      ],
    },
    {
      title: "Documents",
      icon: FaFileAlt,
      children: [
        { title: "View Documents", path: "/documents" },
        { title: "Track Expiry", path: "/documents/expiry" },
      ],
    },
    {
      title: "Reports",
      icon: FaChartBar,
      children: [
        { title: "Basic Reports", path: "/reports/basic" },
        { title: "Compliance Reports", path: "/reports/compliance" },
      ],
    },
  ],
  vendor: [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: FaChartPie,
    },
    {
      title: "My Documents",
      icon: FaFileUpload,
      children: [
        { title: "Upload Documents", path: "/documents/upload" },
        { title: "View Documents", path: "/documents" },
        { title: "Expiry Status", path: "/documents/expiry" },
      ],
    },
    {
      title: "My Profile",
      path: "/profile",
      icon: FaUser,
    },
    {
      title: "Notifications",
      path: "/notifications",
      icon: FaBell,
    },
  ],
};
