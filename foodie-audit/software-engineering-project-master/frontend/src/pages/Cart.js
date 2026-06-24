import { NavLink } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";

export default function CartPage() {
  const { items, restaurantName, subtotal, updateQuantity, removeItem } =
    useCart();

  const deliveryFee = items.length > 0 ? 3 : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-orange-50">
        <Navbar />
        <div className="flex items-center justify-center p-4 pt-24 ">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added anything yet. Let's fix that!
            </p>
            <NavLink
              to="/restaurants"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transition-all duration-300"
            >
              Browse Restaurants
              <ChevronRight size={18} />
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
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center font-bold text-sm">
              {restaurantName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-900">{restaurantName}</p>
              <p className="text-xs text-gray-400">{items.length} items</p>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0"
              >
                <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {item.name}
                  </p>
                  <p className="text-orange-500 font-bold text-sm mt-0.5">
                    {item.price} ILS
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-right min-w-[60px]">
                  <p className="font-bold text-sm">
                    {item.price * item.quantity} ILS
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="space-y-3 text-sm">
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

          <NavLink
            to="/checkout"
            className="mt-6 w-full px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Proceed to Checkout
            <ChevronRight size={18} />
          </NavLink>
        </div>
      </div>
    </div>
  );
}
