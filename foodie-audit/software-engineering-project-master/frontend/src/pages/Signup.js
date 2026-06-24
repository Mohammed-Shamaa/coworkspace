import { NavLink } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useSignupPage } from "../hooks/useSignupPage";
import ButtonSubmit from "../components/ButtonSubmit";
import Navbar from "../components/Navbar";

export default function SignupPage() {
  const {
    handleSubmit,
    handleChange,
    formData,
    showPassword,
    isPending,
    error,
    setShowPassword,
  } = useSignupPage();

  return (
    <div className="min-h-screen bg-orange-50 font-sans">
      <Navbar />

      <div className="flex items-center justify-center p-4 pt-12">
        <div className="relative w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-10">
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-orange-500 mb-2">
                  Join FoodieDelivery
                </h1>
                <p className="text-gray-600 text-sm">
                  Create your account in seconds
                </p>
              </div>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400"
                  placeholder="John Doe"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="bg-red-100 text-center p-2 rounded-xl text-red-500 text-sm">
                  {error}
                </p>
              )}

              <ButtonSubmit isPending={isPending} text="Sign Up" />
            </form>

            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <NavLink
                  to="/login"
                  className="font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Login
                </NavLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
