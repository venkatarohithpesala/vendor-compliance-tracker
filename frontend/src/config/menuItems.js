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
  FaTag,
} from "react-icons/fa";

export const menuItems = {
  super_admin: [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: FaChartPie,
    },
    {
      title: "Companies",
      icon: FaBuilding,
      children: [
        { title: "All Companies", path: "/companies", icon: FaListAlt },
        { title: "Add Company", path: "/companies/add", icon: FaUserPlus },
        {
          title: "Company Status",
          path: "/companies/status",
          icon: FaClipboardCheck,
        },
      ],
    },
    {
      title: "Company Admins",
      icon: FaUserShield,
      children: [
        { title: "All Admins", path: "/admins", icon: FaUsers },
        { title: "Add Admin", path: "/admins/add", icon: FaUserPlus },
        {
          title: "Admin Activity",
          path: "/admins/activity",
          icon: FaClipboardCheck,
        },
      ],
    },
    {
      title: "System Settings",
      icon: FaCog,
      children: [
        {
          title: "Document Types",
          path: "/settings/document-types",
          icon: FaFileContract,
        },
        {
          title: "Email Templates",
          path: "/settings/email-templates",
          icon: FaEnvelopeOpenText,
        },
        {
          title: "System Configuration",
          path: "/settings/configuration",
          icon: FaTools,
        },
      ],
    },
    {
      title: "Reports",
      icon: FaChartBar,
      children: [
        {
          title: "Company Reports",
          path: "/reports/companies",
          icon: FaBuilding,
        },
        { title: "Admin Reports", path: "/reports/admins", icon: FaUserShield },
        { title: "System Reports", path: "/reports/system", icon: FaChartPie },
      ],
    },
    {
      title: "Audit Logs",
      path: "/audit-logs",
      icon: FaClipboardCheck,
    },
  ],
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
          title: "Compliance Categories",
          path: "/compliance/categories",
          icon: FaTag,
        },
        {
          title: "Compliance Requirements",
          path: "/compliance/requirements",
          icon: FaClipboardCheck,
        },
        {
          title: "Compliance Status",
          path: "/compliance/status",
          icon: FaClipboardCheck,
        },
        {
          title: "Compliance Dashboard",
          path: "/compliance/dashboard",
          icon: FaChartBar,
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
