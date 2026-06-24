import usePartnerRegister from "../hooks/usePartnerRegister";
import { NavLink } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import ButtonSubmit from "../components/ButtonSubmit";
import Navbar from "../components/Navbar";

export default function PartnerRegisterPage() {
  const {
    formData,
    showPassword,
    setShowPassword,
    partnerType,
    setPartnerType,
    isPending,
    error,
    setError,
    handleChange,
    handleSubmit,
  } = usePartnerRegister();

  const typeLabel = partnerType === "restaurant" ? "Restaurant" : "Driver";

  return (
    <div className="min-h-screen bg-orange-50 font-sans">
      <Navbar />

      <div className="flex items-center justify-center p-4 pt-12">
        <div className="relative w-full max-w-xl">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-10">
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-orange-500 mb-2">
                  {typeLabel} Registration
                </h2>
                <p className="text-gray-600 text-sm">
                  Submit your details to start expanding your business or
                  earning on the road.
                </p>
              </div>
            </div>

            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 gap-1">
              <button
                type="button"
                onClick={() => {
                  setPartnerType("restaurant");
                  setError(null);
                }}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  partnerType === "restaurant"
                    ? "bg-white text-orange-500 shadow-md scale-[1.02]"
                    : "text-gray-500 hover:text-gray-800 hover:bg-white/40"
                }`}
              >
                Restaurant Partner
              </button>
              <button
                type="button"
                onClick={() => {
                  setPartnerType("driver");
                  setError(null);
                }}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  partnerType === "driver"
                    ? "bg-white text-orange-500 shadow-md scale-[1.02]"
                    : "text-gray-500 hover:text-gray-800 hover:bg-white/40"
                }`}
              >
                Delivery Driver
              </button>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <input type="hidden" name="partnerType" value={partnerType} />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400"
                    placeholder="partner@example.com"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
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
              </div>

              {partnerType === "restaurant" ? (
                <>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="restaurant-name"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Restaurant name
                    </label>
                    <input
                      id="restaurant-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400"
                      placeholder="Grand Kitchen"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contact-phone"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Contact phone
                      </label>
                      <input
                        id="contact-phone"
                        name="phoneNumber"
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400"
                        placeholder="+970 599 000 000"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="cuisine"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Cuisine type
                      </label>
                      <input
                        id="cuisine"
                        name="cuisine"
                        type="text"
                        required
                        value={formData.cuisine}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400"
                        placeholder="Italian, Burgers, etc."
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="address"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Restaurant address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400"
                      placeholder="Al-Rimal, Gaza City"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="rider-name"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Full name
                    </label>
                    <input
                      id="rider-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400"
                      placeholder="Ahmed Ali"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="rider-phone"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Phone number
                      </label>
                      <input
                        id="rider-phone"
                        name="phoneNumber"
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400"
                        placeholder="+970 599 000 000"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="vehicle"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Vehicle type
                      </label>
                      <select
                        id="vehicle"
                        name="vehicleType"
                        required
                        value={formData.vehicleType}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 outline-none transition-all duration-300 cursor-pointer"
                      >
                        <option value="scooter">Scooter / Motorcycle</option>
                        <option value="bicycle">Bicycle</option>
                        <option value="car">Car</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="license-no"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Driving license number (if applicable)
                    </label>
                    <input
                      id="license-no"
                      name="licenseNo"
                      type="text"
                      value={formData.licenseNo}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400"
                      placeholder="1234567"
                    />
                  </div>
                </>
              )}

              {error && (
                <p className="bg-red-100 text-center p-2 rounded-xl text-red-500 text-sm animate-pulse">
                  {error}
                </p>
              )}

              <ButtonSubmit isPending={isPending} text="Submit Application" />
            </form>

            <div className="text-center mt-6 pt-4 border-t border-gray-100">
              <NavLink
                to="/"
                className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                Back to Home
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
