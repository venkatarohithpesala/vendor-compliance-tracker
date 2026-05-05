import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaAngleDown, FaBars } from "react-icons/fa";
import { menuItems } from "../config/menuItems";
import "../styles/scrollbar.css";

function Sidebar({ role }) {
  if (!role || !menuItems[role]) {
    console.error("Invalid role or menu items not found for role:", role);
    return null;
  }
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const newOpenMenus = { ...openMenus };
    menuItems[role]?.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) =>
          isActive(child.path)
        );
        if (hasActiveChild) {
          newOpenMenus[item.title] = true;
        }
      }
    });
    setOpenMenus(newOpenMenus);
  }, [location.pathname, role]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleMenu = (title) => {
    if (!isCollapsed) {
      setOpenMenus((prev) => ({
        ...prev,
        [title]: !prev[title],
      }));
    }
  };

  const isActive = (path) => location.pathname === path;

  const renderMenuItem = (item) => {
    const Icon = item.icon;

    if (item.children) {
      return (
        <div key={item.title} className="space-y-1">
          {/* Only show parent menu item when sidebar is open */}
          {!isCollapsed && (
            <button
              onClick={() => toggleMenu(item.title)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl
                group hover:bg-white/10 transition-all duration-200
                ${openMenus[item.title] ? "bg-white/10" : ""}`}
              style={{ color: "var(--color-sidebar-text)" }}
            >
              <div className="flex items-center gap-3">
                {Icon && <Icon className="w-5 h-5" />}
                <span className="font-medium whitespace-nowrap">
                  {item.title}
                </span>
              </div>
              <FaAngleDown
                className={`w-4 h-4 transition-transform duration-200
                ${openMenus[item.title] ? "rotate-180" : ""}`}
              />
            </button>
          )}

          {/* Show child items for open sidebar */}
          {!isCollapsed && openMenus[item.title] && (
            <div className="mt-2 space-y-1 px-3">
              {item.children.map((child) => (
                <Link
                  key={child.path}
                  to={child.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl
                    hover:bg-white/10 transition-all duration-200 text-sm
                    ${isActive(child.path) ? "bg-white/20" : ""}
                    whitespace-nowrap overflow-hidden text-ellipsis`}
                  style={{ color: "var(--color-sidebar-text)" }}
                >
                  {child.icon && <child.icon className="w-4 h-4" />}
                  {child.title}
                </Link>
              ))}
            </div>
          )}

          {/* Always show child icons when sidebar is collapsed */}
          {isCollapsed && (
            <div className="mt-3 space-y-3">
              {item.children.map((child) => (
                <Link
                  key={child.path}
                  to={child.path}
                  className={`flex items-center justify-center h-8 rounded-lg
                    hover:bg-white/10 transition-all duration-200
                    ${isActive(child.path) ? "bg-white/20" : ""}`}
                  style={{ color: "var(--color-sidebar-text)" }}
                  title={child.title}
                >
                  {child.icon && <child.icon className="w-[18px] h-[18px]" />}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center ${
          isCollapsed ? "justify-center h-8" : "gap-3"
        } px-4 py-2.5 rounded-lg 
          hover:bg-white/10 transition-all duration-200
          ${isActive(item.path) ? "bg-white/20" : ""}`}
        style={{ color: "var(--color-sidebar-text)" }}
        title={isCollapsed ? item.title : undefined}
      >
        {Icon && (
          <Icon
            className={`${isCollapsed ? "w-[18px] h-[18px]" : "w-5 h-5"}`}
          />
        )}
        {!isCollapsed && <span className="font-medium">{item.title}</span>}
      </Link>
    );
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } sticky top-0 h-screen flex flex-col transition-all duration-300`}
      style={{
        background: "var(--color-sidebar-bg)",
        fontFamily: "var(--font-sidebar)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-6 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--color-sidebar-text)" }}
            >
              VenTrack
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-sidebar-text-muted)" }}>
              Secure. Compliant. Simple.
            </p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: "var(--color-sidebar-text)" }}
        >
          <FaBars className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-5 overflow-y-auto pb-4 scrollbar-hide">
        {menuItems[role]?.map(renderMenuItem)}
      </nav>
    </div>
  );
}

export default Sidebar;
