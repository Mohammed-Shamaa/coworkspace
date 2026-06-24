import { NavLink } from "react-router-dom";
import { FileSearch } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center font-sans antialiased px-6">
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl p-12 max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-[1.25rem] bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto">
          <FileSearch size={40} className="text-orange-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900">404</h1>
          <p className="text-lg font-bold text-gray-700">Page Not Found</p>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <NavLink
          to="/"
          className="inline-block w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/10 transition-all duration-300"
        >
          Back to Home
        </NavLink>
      </div>
    </div>
  );
}
