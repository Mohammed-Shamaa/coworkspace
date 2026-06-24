import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  Truck,
  Search,
  Check,
  X,
  Mail,
  Phone,
  Star,
  ToggleLeft,
  ToggleRight,
  Clock,
  DollarSign,
  ShoppingBag,
  UserCheck,
  UserX,
  Activity,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAdminDashboard } from "../hooks/useAdminDashboard";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    tab,
    setTab,
    stats,
    users,
    filteredUsers,
    pendingRestaurants,
    drivers,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    toggleUserActive,
    approveRestaurant,
    rejectRestaurant,
    approveDriver,
    rejectDriver,
  } = useAdminDashboard();

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div
      className="min-h-screen bg-orange-50/40 font-sans antialiased text-gray-900"
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
              Admin Portal
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
            onClick={() => setTab("overview")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
              tab === "overview"
                ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                : "text-gray-500 hover:bg-orange-50/50 hover:text-orange-500"
            }`}
          >
            <LayoutDashboard size={22} />
            Overview
          </button>

          <button
            onClick={() => setTab("users")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
              tab === "users"
                ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                : "text-gray-500 hover:bg-orange-50/50 hover:text-orange-500"
            }`}
          >
            <Users size={22} />
            Users
          </button>

          <button
            onClick={() => setTab("restaurants")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
              tab === "restaurants"
                ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                : "text-gray-500 hover:bg-orange-50/50 hover:text-orange-500"
            }`}
          >
            <Store size={22} />
            Restaurants
            {pendingRestaurants.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-black">
                {pendingRestaurants.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab("drivers")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
              tab === "drivers"
                ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                : "text-gray-500 hover:bg-orange-50/50 hover:text-orange-500"
            }`}
          >
            <Truck size={22} />
            Drivers
          </button>
        </nav>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <User size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Admin</p>
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

        {/* ===== OVERVIEW TAB ===== */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                Dashboard Overview
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Full platform snapshot at a glance
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Users size={24} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-400 uppercase tracking-wider">
                    Total Users
                  </p>
                  <p className="text-3xl font-black text-gray-900 mt-1">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Activity size={14} />
                  <span>{users.filter((u) => u.isActive).length} active</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                  <Store size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-400 uppercase tracking-wider">
                    Restaurants
                  </p>
                  <p className="text-3xl font-black text-gray-900 mt-1">
                    {stats.totalRestaurants}
                  </p>
                </div>
                {stats.pendingRestaurants > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg w-fit">
                    <Clock size={12} /> {stats.pendingRestaurants} pending
                    approval
                  </span>
                )}
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Truck size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-400 uppercase tracking-wider">
                    Drivers
                  </p>
                  <p className="text-3xl font-black text-gray-900 mt-1">
                    {stats.totalDrivers}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg w-fit">
                  <UserCheck size={12} /> {stats.availableDrivers} available
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                  <DollarSign size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-400 uppercase tracking-wider">
                    Revenue
                  </p>
                  <p className="text-3xl font-black text-gray-900 mt-1">
                    {stats.revenue.toLocaleString()} ILS
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg w-fit">
                  <ShoppingBag size={12} /> {stats.totalOrders} orders
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="font-black text-gray-900 text-lg">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTab("restaurants")}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-100/50 transition-colors text-left"
                  >
                    <Store size={20} className="text-orange-600" />
                    <span className="font-bold text-sm text-gray-900">
                      Review Restaurants
                    </span>
                  </button>
                  <button
                    onClick={() => setTab("drivers")}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-100/50 transition-colors text-left"
                  >
                    <Truck size={20} className="text-blue-600" />
                    <span className="font-bold text-sm text-gray-900">
                      Manage Drivers
                    </span>
                  </button>
                  <button
                    onClick={() => setTab("users")}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 hover:bg-green-100 border border-green-100/50 transition-colors text-left"
                  >
                    <Users size={20} className="text-green-600" />
                    <span className="font-bold text-sm text-gray-900">
                      View Users
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="font-black text-gray-900 text-lg">
                  Pending Items
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-100/50">
                    <div className="flex items-center gap-3">
                      <Store size={18} className="text-amber-600" />
                      <span className="font-bold text-sm text-gray-900">
                        Restaurant Approvals
                      </span>
                    </div>
                    <span className="text-sm font-black text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-lg">
                      {stats.pendingRestaurants}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 border border-blue-100/50">
                    <div className="flex items-center gap-3">
                      <Truck size={18} className="text-blue-600" />
                      <span className="font-bold text-sm text-gray-900">
                        Driver Approvals
                      </span>
                    </div>
                    <span className="text-sm font-black text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-lg">
                      {stats.pendingDrivers}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== USERS TAB ===== */}
        {tab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900">Users</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage all platform users
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-3 rounded-xl bg-white ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 font-medium outline-none transition-all text-sm"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-white ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 font-bold outline-none cursor-pointer transition-all text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="partner">Partners</option>
                  <option value="driver">Drivers</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100">
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider">
                        Name
                      </th>
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider">
                        Email
                      </th>
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider">
                        Role
                      </th>
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider">
                        Status
                      </th>
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center">
                          <div className="space-y-2">
                            <Search
                              size={32}
                              className="mx-auto text-gray-300"
                            />
                            <p className="text-base font-bold text-gray-500">
                              No users found
                            </p>
                            <p className="text-sm text-gray-400">
                              Try a different search or filter.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-orange-50/10 transition-colors"
                        >
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center font-bold text-orange-600 text-sm shadow-inner shrink-0">
                                {user.name.charAt(0)}
                              </div>
                              <span className="font-bold text-gray-900 text-sm">
                                {user.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-5 text-sm font-medium text-gray-500">
                            {user.email}
                          </td>
                          <td className="p-5">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full ${
                                user.role === "admin"
                                  ? "bg-purple-50 text-purple-700 border border-purple-100"
                                  : user.role === "partner"
                                    ? "bg-green-50 text-green-700 border border-green-100"
                                    : user.role === "driver"
                                      ? "bg-blue-50 text-blue-700 border border-blue-100"
                                      : "bg-gray-50 text-gray-700 border border-gray-100"
                              }`}
                            >
                              {user.role === "partner" && <Store size={12} />}
                              {user.role === "driver" && <Truck size={12} />}
                              {user.role === "user" && <UserCheck size={12} />}
                              {user.role}
                            </span>
                          </td>
                          <td className="p-5 text-sm font-medium text-gray-500">
                            {user.joined}
                          </td>
                          <td className="p-5">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full ${
                                user.isActive
                                  ? "bg-green-50 text-green-700 border border-green-100"
                                  : "bg-red-50 text-red-600 border border-red-100"
                              }`}
                            >
                              {user.isActive ? (
                                <UserCheck size={12} />
                              ) : (
                                <UserX size={12} />
                              )}
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            <button
                              onClick={() => toggleUserActive(user.id)}
                              className={`inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl transition-all ${
                                user.isActive
                                  ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                                  : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-100"
                              }`}
                            >
                              {user.isActive ? (
                                <ToggleLeft size={16} />
                              ) : (
                                <ToggleRight size={16} />
                              )}
                              {user.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== RESTAURANTS TAB ===== */}
        {tab === "restaurants" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                Restaurant Approvals
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Review and approve new restaurant applications
              </p>
            </div>

            {pendingRestaurants.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center space-y-3">
                <Store size={36} className="mx-auto text-gray-300" />
                <p className="text-lg font-bold text-gray-500">
                  All caught up!
                </p>
                <p className="text-sm text-gray-400">
                  No pending restaurant approvals.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="bg-white border border-gray-100/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-black text-xl text-gray-900">
                            {restaurant.name}
                          </h3>
                          <p className="text-gray-500 text-sm font-medium mt-1">
                            by {restaurant.owner}
                          </p>
                        </div>
                        <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-xl flex items-center gap-1.5">
                          <Clock size={12} /> Pending
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                          <Phone size={14} className="text-gray-400" />{" "}
                          {restaurant.phone}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                          <Mail size={14} className="text-gray-400" />{" "}
                          {restaurant.submitted}
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => approveRestaurant(restaurant.id)}
                          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-green-500/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button
                          onClick={() => rejectRestaurant(restaurant.id)}
                          className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-2xl border border-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== DRIVERS TAB ===== */}
        {tab === "drivers" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Drivers</h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage delivery drivers and approvals
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100">
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider">
                        Status
                      </th>
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center">
                          <div className="space-y-2">
                            <Truck
                              size={32}
                              className="mx-auto text-gray-300"
                            />
                            <p className="text-base font-bold text-gray-500">
                              No drivers registered
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      drivers.map((driver) => (
                        <tr
                          key={driver.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-orange-50/10 transition-colors"
                        >
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-600 text-sm shadow-inner shrink-0">
                                {driver.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 text-sm block">
                                  {driver.name}
                                </span>
                                <span className="text-xs font-medium text-gray-400">
                                  {driver.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 text-sm font-bold text-gray-600">
                            {driver.vehicle}
                          </td>
                          <td className="p-5 text-sm font-medium text-gray-500">
                            {driver.phone}
                          </td>
                          <td className="p-5">
                            {driver.rating > 0 ? (
                              <span className="inline-flex items-center gap-1 text-sm font-black text-amber-600">
                                <Star
                                  size={14}
                                  className="fill-amber-500 text-amber-500"
                                />{" "}
                                {driver.rating}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 font-medium">
                                —
                              </span>
                            )}
                          </td>
                          <td className="p-5">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full ${
                                driver.isApproved && driver.isAvailable
                                  ? "bg-green-50 text-green-700 border border-green-100"
                                  : driver.isApproved
                                    ? "bg-gray-100 text-gray-600 border border-gray-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}
                            >
                              {driver.isApproved && driver.isAvailable && (
                                <Activity size={12} />
                              )}
                              {driver.isApproved
                                ? driver.isAvailable
                                  ? "Available"
                                  : "On Delivery"
                                : "Pending"}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            {!driver.isApproved ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => approveDriver(driver.id)}
                                  className="inline-flex items-center gap-1.5 text-xs font-black px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
                                >
                                  <Check size={14} /> Approve
                                </button>
                                <button
                                  onClick={() => rejectDriver(driver.id)}
                                  className="inline-flex items-center gap-1.5 text-xs font-black px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl transition-colors"
                                >
                                  <X size={14} /> Reject
                                </button>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                                <Check size={14} /> Approved
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
