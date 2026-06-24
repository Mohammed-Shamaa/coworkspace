import { useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { Star, Clock, MapPin, Plus, Check } from "lucide-react";
import { restaurants, menuItems } from "../data/mockData";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const restaurant = restaurants.find((r) => r.id === Number(id));
  const items = menuItems[Number(id)] || [];
  const { addItem, restaurantId, restaurantName, clearCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");
  const [addedItemId, setAddedItemId] = useState(null);
  const [showCartWarning, setShowCartWarning] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-400">Not Found</p>
          <NavLink
            to="/restaurants"
            className="text-orange-500 font-semibold mt-2 inline-block"
          >
            Browse restaurants
          </NavLink>
        </div>
      </div>
    );
  }

  const allCategories = items
    .map((i) => i.category)
    .filter((v, i, a) => a.indexOf(v) === i);
  const categories = ["All", ...allCategories];

  const filtered =
    activeCategory === "All"
      ? items
      : items.filter((i) => i.category === activeCategory);

  const handleAdd = (item) => {
    if (restaurantId && restaurantId !== restaurant.id) {
      setPendingItem(item);
      setShowCartWarning(true);
      return;
    }
    addItem(item, restaurant);
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 1500);
  };

  const handleClearAndAdd = () => {
    if (!pendingItem) return;
    clearCart();
    setShowCartWarning(false);
    addItem(pendingItem, restaurant);
    setPendingItem(null);
    setAddedItemId(pendingItem.id);
    setTimeout(() => setAddedItemId(null), 1200);
  };

  return (
    <div className="min-h-screen text-gray-900 font-sans bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="h-56 bg-gray-100">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                {restaurant.rating} ({restaurant.reviewCount})
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {restaurant.deliveryTime} min
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={16} />
                {restaurant.deliveryFee} ILS delivery
              </span>
              <span className="text-xs text-gray-400 font-semibold">
                Min. {restaurant.minOrder} ILS
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto py-5 mt-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeCategory === cat
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "bg-white border border-gray-200 text-gray-600 hover:border-orange-500"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {showCartWarning && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              You already have items from{" "}
              <span className="text-orange-500">{restaurantName}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              You can only order from one restaurant at a time.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCartWarning(false)}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:border-gray-300 transition-all"
              >
                Keep Current
              </button>
              <button
                onClick={handleClearAndAdd}
                className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-all"
              >
                Clear & Add from Here
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4 pb-24">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 shadow-sm hover:border-orange-200 transition-all duration-300"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-orange-500">
                    {item.price} ILS
                  </span>
                  <button
                    onClick={() => handleAdd(item)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${addedItemId === item.id
                      ? "bg-green-500 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                      }`}
                  >
                    {addedItemId === item.id ? (
                      <>
                        <Check size={16} />
                        Added
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
