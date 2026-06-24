import { NavLink } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function NotAuthorization() {
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center font-sans antialiased px-6">
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl p-12 max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-[1.25rem] bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
          <ShieldAlert size={40} className="text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900">403</h1>
          <p className="text-lg font-bold text-gray-700">Access Denied</p>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            You don't have permission to view this page.
            <br />
            Please contact support if you think this is a mistake.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <NavLink
            to="/"
            className="flex-1 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/10 transition-all duration-300"
          >
            Back to Home
          </NavLink>
          <NavLink
            to="/login"
            className="flex-1 py-3.5 rounded-2xl bg-white border border-gray-200 hover:border-orange-200 hover:text-orange-500 text-gray-700 font-bold text-sm transition-all duration-300"
          >
            Sign In
          </NavLink>
        </div>
      </div>
    </div>
  );
}
