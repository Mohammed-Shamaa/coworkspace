import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, LogOut } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const isRegularUser = !user || user.role === "user";

  const dashboardLink =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "partner"
        ? "/partner/dashboard"
        : user?.role === "driver"
          ? "/driver/dashboard"
          : null;

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${
      isActive ? "text-orange-500" : "text-gray-600 hover:text-orange-500"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 py-3 text-sm font-semibold transition-colors ${
      isActive ? "text-orange-500" : "text-gray-600 hover:text-orange-500"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-20 flex items-center justify-between">
          <NavLink to="/">
            <span className="text-2xl font-black tracking-tight">
              Foodie<span className="text-orange-500">Delivery</span>
            </span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>

            {isRegularUser && (
              <NavLink to="/restaurants" className={linkClass}>
                Restaurants
              </NavLink>
            )}

            {dashboardLink && (
              <NavLink to={dashboardLink} className={linkClass}>
                Dashboard
              </NavLink>
            )}

            {isRegularUser && (
              <NavLink
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </NavLink>
            )}

            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <p className="text-sm font-bold text-gray-900">
                  <span className="text-orange-500">Hello </span>
                  {user.name}
                </p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <NavLink to="/login" className={linkClass}>
                  Sign In
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all duration-300"
                >
                  Sign Up
                </NavLink>
              </div>
            )}
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-orange-500 transition-colors"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-1">
            {user && (
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">
                  <span className="text-orange-500">Hello, </span>
                  {user.name}
                </p>
              </div>
            )}

            <NavLink to="/" onClick={closeMenu} className={mobileLinkClass}>
              Home
            </NavLink>

            {isRegularUser && (
              <NavLink
                to="/restaurants"
                onClick={closeMenu}
                className={mobileLinkClass}
              >
                Restaurants
              </NavLink>
            )}

            {dashboardLink && (
              <NavLink
                to={dashboardLink}
                onClick={closeMenu}
                className={mobileLinkClass}
              >
                Dashboard
              </NavLink>
            )}

            {isRegularUser && (
              <NavLink
                to="/cart"
                onClick={closeMenu}
                className={mobileLinkClass}
              >
                <div className="relative">
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </div>
                Cart
              </NavLink>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:text-red-500 hover:border-red-200 font-semibold transition-all duration-300"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <div className="pt-4 space-y-3">
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className="block text-center py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:border-orange-200 hover:text-orange-500 transition-all duration-300"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={closeMenu}
                  className="block text-center py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transition-all duration-300"
                >
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
