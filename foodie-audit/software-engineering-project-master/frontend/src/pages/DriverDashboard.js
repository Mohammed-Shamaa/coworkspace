import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  DollarSign,
  CheckCircle,
  Clock,
  Phone,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDriverDashboard } from "../hooks/useDriverDashboard";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    tab,
    setTab,
    availableOrders,
    currentOrder,
    step,
    done,
    earnings,
    showCancelConfirm,
    acceptOrder,
    nextStep,
    requestCancel,
    confirmCancel,
    dismissCancel,
  } = useDriverDashboard();

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div
      className="min-h-screen bg-orange-50/30 font-sans antialiased text-gray-900"
      style={{ direction: "ltr" }}
    >
      {/* mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-100 flex flex-col shadow-sm transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xl font-black tracking-tight block text-gray-900">
              Foodie<span className="text-orange-500">Delivery</span>
            </span>
            <span className="text-xs font-semibold text-gray-400 mt-1 block">
              Rider Portal
            </span>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 flex-1 flex flex-col gap-2">
          <button
            onClick={() => setTab("available")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
              tab === "available"
                ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                : "text-gray-500 hover:bg-orange-50/50 hover:text-orange-500"
            }`}
          >
            <ShoppingBag size={22} />
            Available Orders
            {availableOrders.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-black">
                {availableOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab("active")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
              tab === "active"
                ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                : "text-gray-500 hover:bg-orange-50/50 hover:text-orange-500"
            }`}
          >
            <Navigation size={22} />
            Active Delivery
            {currentOrder && (
              <span className="ml-auto h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setTab("earnings")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
              tab === "earnings"
                ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                : "text-gray-500 hover:bg-orange-50/50 hover:text-orange-500"
            }`}
          >
            <TrendingUp size={22} />
            My Earnings
          </button>
        </nav>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <User size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Karam Ali</p>
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>{" "}
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-80 p-4 md:p-10 overflow-y-auto max-w-7xl">
        {/* mobile header */}
        <div className="flex items-center gap-3 mb-6 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-colors"
          >
            <Menu size={22} />
          </button>
          <span className="text-lg font-black tracking-tight text-gray-900">
            Foodie<span className="text-orange-500">Delivery</span>
          </span>
        </div>

        {/* available orders */}
        {tab === "available" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                Available Orders
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Pick an order to start delivery
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableOrders.length > 0 ? (
                availableOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-gray-100/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-all duration-300"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-xl text-xs">
                          {order.id}
                        </span>
                        <div className="flex items-center gap-1 text-sm font-black text-green-600 bg-green-50 px-3 py-1 rounded-xl">
                          <DollarSign size={14} /> {order.payout} ILS
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
                          🏪 {order.restaurant}
                        </h3>
                        <p className="text-gray-500 text-sm font-medium flex items-center gap-1.5">
                          <MapPin size={16} className="text-gray-400" />{" "}
                          {order.address}
                        </p>
                        <p className="text-gray-400 text-xs font-bold">
                          📍 {order.distance} away
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => acceptOrder(order)}
                      className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <Navigation size={16} /> Accept Order
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-500 space-y-2">
                  <AlertCircle size={36} className="mx-auto text-gray-400" />
                  <p className="text-lg font-bold">
                    No orders available right now
                  </p>
                  <p className="text-sm text-gray-400">Check back soon.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* active delivery */}
        {tab === "active" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                Current Delivery
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Update the delivery status as you go
              </p>
            </div>

            {currentOrder ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-8">
                  <div className="relative flex justify-between items-center max-w-md mx-auto">
                    <div className="absolute left-0 right-0 h-1 bg-gray-100 top-1/2 -translate-y-1/2"></div>
                    <div
                      className={`absolute left-0 h-1 bg-orange-500 top-1/2 -translate-y-1/2 transition-all duration-500 ${step === 1 ? "w-1/2" : "w-full"}`}
                    ></div>

                    <div className="flex flex-col items-center gap-2 bg-white px-2 z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-400"}`}
                      >
                        1
                      </div>
                      <span className="text-xs font-black">Pickup</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 bg-white px-2 z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-400"}`}
                      >
                        2
                      </div>
                      <span className="text-xs font-black">Dropoff</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 bg-white px-2 z-10">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 bg-white border-gray-200 text-gray-400">
                        <CheckCircle size={18} />
                      </div>
                      <span className="text-xs font-black">Done</span>
                    </div>
                  </div>

                  <div className="p-6 bg-orange-50/40 border border-orange-100/50 rounded-2xl space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shrink-0">
                        {step === 1 ? "🏪" : "👤"}
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-lg font-black text-gray-900">
                          {step === 1
                            ? `Go to: ${currentOrder.restaurant}`
                            : "Heading to customer"}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                          {step === 1
                            ? currentOrder.address
                            : "Remal Street - Tower A, 3rd Floor"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <a
                        href="tel:059900000"
                        className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <Phone size={14} /> Call Support
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={nextStep}
                      className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white text-base font-black rounded-2xl shadow-xl shadow-orange-500/10 transition-colors flex items-center justify-center gap-2"
                    >
                      {step === 1
                        ? "✔ Picked up from restaurant"
                        : "🏁 Delivered to customer"}
                    </button>
                    <button
                      onClick={requestCancel}
                      className="px-5 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl text-sm transition-all"
                    >
                      Cancel
                    </button>
                  </div>

                  {showCancelConfirm && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between gap-4">
                      <p className="text-sm font-bold text-red-700">
                        Cancel this delivery?
                      </p>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={confirmCancel}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-xl transition-colors"
                        >
                          Yes, cancel
                        </button>
                        <button
                          onClick={dismissCancel}
                          className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                        >
                          Keep going
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-black text-base text-gray-400 uppercase tracking-wider">
                    Order Summary
                  </h3>
                  <div className="space-y-3 divide-y divide-gray-50">
                    <div className="flex justify-between py-2 text-sm font-medium text-gray-600">
                      <span>Order ID</span>
                      <span className="font-mono font-bold text-gray-900">
                        {currentOrder.id}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium text-gray-600">
                      <span>Collect from customer</span>
                      <span className="font-bold text-gray-900">54 ILS</span>
                    </div>
                    <div className="flex justify-between py-3 text-sm font-medium text-gray-600">
                      <span>Your earnings</span>
                      <span className="font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                        {currentOrder.payout} ILS
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 space-y-3">
                <Navigation size={36} className="mx-auto text-gray-300" />
                <p className="text-lg font-bold">No active delivery</p>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Go to Available Orders and accept one to start.
                </p>
                <button
                  onClick={() => setTab("available")}
                  className="mt-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  View Orders
                </button>
              </div>
            )}
          </div>
        )}

        {/* earnings */}
        {tab === "earnings" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">My Earnings</h1>
              <p className="text-gray-500 text-sm mt-1">Today's summary</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Today's Earnings
                </p>
                <p className="text-4xl font-black text-gray-900">
                  {earnings} ILS
                </p>
                <span className="inline-block text-xs text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-lg">
                  💵 Cash
                </span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Deliveries Done
                </p>
                <p className="text-4xl font-black text-gray-900">{done}</p>
                <span className="inline-block text-xs text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-lg">
                  Rating: 5.0 ⭐
                </span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Hours Online
                </p>
                <p className="text-4xl font-black text-gray-900">
                  3.5{" "}
                  <span className="text-sm font-normal text-gray-400">hrs</span>
                </p>
                <span className="inline-block text-xs text-gray-400 font-bold bg-gray-50 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                  <Clock size={12} /> Active today
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
