import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaAngleDown } from "react-icons/fa";
import { menuItems } from "../config/menuItems";

function Sidebar({ role = "admin" }) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (path) => location.pathname === path;

  const renderMenuItem = (item) => {
    const Icon = item.icon;

    if (item.children) {
      return (
        <div key={item.title} className="space-y-1">
          <button
            onClick={() => toggleMenu(item.title)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl
              text-[#faedcd] group hover:bg-white/10 transition-all duration-200
              ${openMenus[item.title] ? "bg-white/10" : ""}`}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="w-5 h-5" />}
              <span className="font-medium whitespace-nowrap">
                {item.title}
              </span>
            </div>
            {item.children && (
              <FaAngleDown
                className={`w-4 h-4 transition-transform duration-200
                ${openMenus[item.title] ? "rotate-180" : ""}`}
              />
            )}
          </button>

          {openMenus[item.title] && (
            <div className="mt-2 space-y-1 px-3">
              {item.children.map((child) => (
                <Link
                  key={child.path}
                  to={child.path}
                  className={`block px-4 py-2 rounded-xl text-[#faedcd]/90 
                    hover:bg-white/10 hover:text-[#faedcd] transition-all duration-200 text-sm
                    ${isActive(child.path) ? "bg-white/20 text-[#faedcd]" : ""}
                    whitespace-nowrap overflow-hidden text-ellipsis`}
                >
                  {child.title}
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
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl 
          text-[#faedcd] hover:bg-white/10 transition-all duration-200
          ${isActive(item.path) ? "bg-white/20" : ""}`}
      >
        {Icon && <Icon className="w-5 h-5" />}
        <span className="font-medium">{item.title}</span>
      </Link>
    );
  };

  return (
    <div
      className="w-64 h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #90323d 0%, #5e0b15 100%)",
      }}
    >
      {/* Header */}
      <div className="px-6 py-8">
        <h1 className="text-[#faedcd] text-2xl font-bold tracking-tight">
          VenTrack
        </h1>
        <p className="text-[#faedcd]/70 text-sm mt-1">
          Secure. Compliant. Simple.
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto pb-4">
        {menuItems[role]?.map(renderMenuItem)}
      </nav>
    </div>
  );
}

export default Sidebar;
