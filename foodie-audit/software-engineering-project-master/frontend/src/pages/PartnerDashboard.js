import React, { useState } from "react";
import {
  ClipboardList,
  Utensils,
  TrendingUp,
  Plus,
  Check,
  Clock,
  Truck,
  ToggleLeft,
  ToggleRight,
  Edit3,
  Trash2,
  UtensilsCrossed,
  Star,
  PackageOpen,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePartnerDashboard } from "../hooks/usePartnerDashboard";

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    tab,
    setTab,
    orders,
    menuItems,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    formName,
    setFormName,
    formPrice,
    setFormPrice,
    formCategory,
    setFormCategory,
    updateStatus,
    toggleItem,
    openAdd,
    openEdit,
    requestDelete,
    confirmDelete,
    dismissDelete,
    deleteTargetId,
    saveItem,
  } = usePartnerDashboard();

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
              Partner Portal
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
            onClick={() => setTab("orders")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
              tab === "orders"
                ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                : "text-gray-500 hover:bg-orange-50/50 hover:text-orange-500"
            }`}
          >
            <ClipboardList size={22} />
            Orders
          </button>

          <button
            onClick={() => setTab("menu")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
              tab === "menu"
                ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                : "text-gray-500 hover:bg-orange-50/50 hover:text-orange-500"
            }`}
          >
            <Utensils size={22} />
            Menu
          </button>

          <button
            onClick={() => setTab("stats")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
              tab === "stats"
                ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                : "text-gray-500 hover:bg-orange-50/50 hover:text-orange-500"
            }`}
          >
            <TrendingUp size={22} />
            Stats
          </button>
        </nav>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <User size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Captain Gate Kitchen
                </p>
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>{" "}
                  Accepting Orders
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

        {/* orders tab */}
        {tab === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-gray-900">
                  Incoming Orders
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage and update your orders
                </p>
              </div>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {orders.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center space-y-3">
                  <PackageOpen size={36} className="mx-auto text-gray-300" />
                  <p className="text-lg font-bold text-gray-500">
                    No incoming orders yet
                  </p>
                  <p className="text-sm text-gray-400">
                    New orders will appear here automatically.
                  </p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-gray-100/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all duration-300"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-xl text-sm">
                          {order.id}
                        </span>
                        <h3 className="font-bold text-lg text-gray-900">
                          {order.customer}
                        </h3>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                            order.status === "Pending"
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : order.status === "Preparing"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-blue-50 text-blue-600 border border-blue-100"
                          }`}
                        >
                          {order.status === "Pending" && <Clock size={12} />}
                          {order.status === "Preparing" && (
                            <Utensils size={12} />
                          )}
                          {order.status === "With Rider" && <Truck size={12} />}
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gray-600 font-medium text-sm">
                        {order.items}
                      </p>
                      <p className="text-gray-900 font-black text-base">
                        Total:{" "}
                        <span className="text-orange-500">{order.total}</span>
                      </p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                      {order.status === "Pending" && (
                        <button
                          onClick={() => updateStatus(order.id, "Preparing")}
                          className="w-full md:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-orange-500/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <Check size={16} /> Accept & Start Cooking
                        </button>
                      )}
                      {order.status === "Preparing" && (
                        <button
                          onClick={() => updateStatus(order.id, "With Rider")}
                          className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-green-500/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <Truck size={16} /> Hand to Rider
                        </button>
                      )}
                      {order.status === "With Rider" && (
                        <div className="text-sm text-gray-400 bg-gray-50 border border-gray-200/60 px-4 py-3 rounded-2xl font-bold text-center w-full md:w-auto flex items-center justify-center gap-2">
                          <Clock size={14} /> Out for Delivery
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* menu tab */}
        {tab === "menu" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900">Menu</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Add, edit or hide your menu items
                </p>
              </div>
              <button
                onClick={openAdd}
                className="px-5 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-orange-500/10 transition-all duration-300 hover:scale-[1.02]"
              >
                <Plus size={18} /> Add Item
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100">
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider">
                        Item
                      </th>
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider">
                        Category
                      </th>
                      <th className="p-5 font-black text-gray-400 text-xs uppercase tracking-wider">
                        Price
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
                    {menuItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center">
                          <div className="space-y-2">
                            <UtensilsCrossed
                              size={32}
                              className="mx-auto text-gray-300"
                            />
                            <p className="text-base font-bold text-gray-500">
                              No menu items yet
                            </p>
                            <p className="text-sm text-gray-400">
                              Click "Add Item" to add your first dish.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      menuItems.map((item) => (
                        <React.Fragment key={item.id}>
                          <tr className="border-b border-gray-50 last:border-0 hover:bg-orange-50/10 transition-colors">
                            <td className="p-5">
                              <div className="flex items-center gap-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-inner"
                                />
                                <span className="font-bold text-gray-900 text-base">
                                  {item.name}
                                </span>
                              </div>
                            </td>
                            <td className="p-5 text-sm font-bold text-gray-500">
                              {item.category}
                            </td>
                            <td className="p-5 font-black text-gray-900 text-base">
                              {item.price} ILS
                            </td>
                            <td className="p-5">
                              <button
                                onClick={() => toggleItem(item.id)}
                                className={`inline-flex items-center gap-2 text-xs font-black px-3 py-1.5 rounded-full transition-all ${
                                  item.available
                                    ? "bg-green-50 text-green-700 border border-green-100"
                                    : "bg-gray-100 text-gray-500 border border-gray-200"
                                }`}
                              >
                                {item.available ? (
                                  <ToggleRight
                                    size={18}
                                    className="text-green-600"
                                  />
                                ) : (
                                  <ToggleLeft
                                    size={18}
                                    className="text-gray-400"
                                  />
                                )}
                                {item.available ? "Available" : "Hidden"}
                              </button>
                            </td>
                            <td className="p-5 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openEdit(item)}
                                  className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                                >
                                  <Edit3 size={18} />
                                </button>
                                <button
                                  onClick={() => requestDelete(item.id)}
                                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {deleteTargetId === item.id && (
                            <tr>
                              <td colSpan={5} className="px-5 pb-4">
                                <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-2xl px-4 py-3 gap-4">
                                  <p className="text-sm font-bold text-red-700">
                                    Delete "{item.name}"?
                                  </p>
                                  <div className="flex gap-2 shrink-0">
                                    <button
                                      onClick={confirmDelete}
                                      className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-xl transition-colors"
                                    >
                                      Delete
                                    </button>
                                    <button
                                      onClick={dismissDelete}
                                      className="px-4 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* stats tab */}
        {tab === "stats" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                Today's Stats
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Quick overview of your restaurant's performance
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Revenue
                </p>
                <p className="text-4xl font-black text-gray-900">158 ILS</p>
                <span className="inline-block text-xs text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                  <TrendingUp size={12} /> +12% from yesterday
                </span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Orders
                </p>
                <p className="text-4xl font-black text-gray-900">6</p>
                <span className="inline-block text-xs text-gray-400 font-bold bg-gray-50 px-2.5 py-1 rounded-lg">
                  All delivered on time
                </span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Rating
                </p>
                <p className="text-4xl font-black text-amber-500 flex items-center gap-2">
                  <Star size={32} className="fill-amber-500 text-amber-500" />{" "}
                  4.8
                </p>
                <span className="inline-block text-xs text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-lg">
                  Top in your area
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* add/edit modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 max-w-md w-full p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                {editingItem ? "Edit Item" : "Add Item"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Fill in the item details
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveItem();
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Crispy Chicken"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 font-medium outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">
                    Price (ILS)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="25"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 font-medium outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-gray-900 font-bold outline-none cursor-pointer transition-all"
                  >
                    <option value="Burgers">Burgers</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Sides">Sides</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/10 transition-colors"
                >
                  {editingItem ? "Save" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
