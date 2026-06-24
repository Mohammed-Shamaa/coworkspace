import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MapPin,
  Phone,
  User,
  CreditCard,
  ChevronRight,
  CheckCircle,
  LogIn,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, restaurantName, subtotal, clearCart } = useCart();
  const [isPlacing, setIsPlacing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [placedOrderName, setPlacedOrderName] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    payment: "cash",
  });

  const deliveryFee = 3;
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (!user) {
    return (
      <div className="min-h-screen text-gray-900 font-sans bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center p-4 pt-24">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mx-auto mb-6">
              <LogIn size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              You are not logged in
            </h2>
            <p className="text-gray-500 mb-8">
              Please sign in or create an account to complete your order.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <NavLink
                to="/login"
                className="px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transition-all duration-300"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className="px-6 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-800 hover:border-orange-500 font-bold transition-all duration-300"
              >
                Create Account
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    if (isPlacing) return;
    e.preventDefault();
    setIsPlacing(true);
    setPlacedOrderName(restaurantName);
    setTimeout(() => {
      setIsPlacing(false);
      setIsDone(true);
      clearCart();
    }, 2000);
  };

  if (isDone) {
    return (
      <div className="min-h-screen text-gray-900 font-sans bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed!
          </h2>
          <p className="text-gray-500 mb-2">
            Your order from <strong>{placedOrderName}</strong> is being
            prepared.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            You can track its status in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <NavLink
              to="/orders/1"
              className="px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transition-all duration-300"
            >
              Track Order
            </NavLink>
            <NavLink
              to="/restaurants"
              className="px-6 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-800 hover:border-orange-500 font-bold transition-all duration-300"
            >
              Order Again
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen text-gray-900 font-sans bg-orange-50">
        <Navbar />
        <div className="flex items-center justify-center p-4 pt-24">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8">
              Add some items to your cart before checking out.
            </p>
            <NavLink
              to="/restaurants"
              className="inline-flex px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transition-all duration-300"
            >
              Browse Restaurants
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900 font-sans bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-4">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <User size={18} className="text-orange-500" />
              Delivery Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 outline-none transition-all duration-300"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 outline-none transition-all duration-300"
                    placeholder="+970 5X XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Delivery Address
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3.5 top-3.5 text-gray-400"
                  />
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 outline-none transition-all duration-300 resize-none"
                    placeholder="Street, building, apartment, landmark..."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Order Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 outline-none transition-all duration-300 resize-none"
                  placeholder="Any special instructions for the restaurant..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-4">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <CreditCard size={18} className="text-orange-500" />
              Payment Method
            </h2>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 border-2 border-orange-500 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={form.payment === "cash"}
                onChange={handleChange}
                className="accent-orange-500"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  Cash on Delivery
                </p>
                <p className="text-xs text-gray-500">
                  Pay when your food arrives
                </p>
              </div>
            </label>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm mb-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-gray-600"
                >
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>{item.price * item.quantity} ILS</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm pt-4 border-t border-gray-100">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{subtotal} ILS</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span>{deliveryFee} ILS</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-3 border-t border-gray-100">
                <span>Total</span>
                <span>{total} ILS</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPlacing}
              className="mt-6 w-full px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/80 text-white font-bold shadow-lg shadow-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {isPlacing ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </span>
              ) : (
                <>
                  Place Order — {total} ILS
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
