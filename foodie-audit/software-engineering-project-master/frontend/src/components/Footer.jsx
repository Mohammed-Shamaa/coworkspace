import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xl font-black tracking-tight text-white">
              Foodie<span className="text-orange-500">Delivery</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-gray-400">
            <NavLink
              to="/partner/register"
              className="hover:text-orange-400 transition-colors"
            >
              Partners
            </NavLink>
            <NavLink
              to="/login"
              className="hover:text-orange-400 transition-colors"
            >
              Sign In
            </NavLink>
            <NavLink
              to="/signup"
              className="hover:text-orange-400 transition-colors"
            >
              Sign Up
            </NavLink>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-800 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} FoodieDelivery. All rights reserved.
        </div>
      </div>
    </footer>
  );
}