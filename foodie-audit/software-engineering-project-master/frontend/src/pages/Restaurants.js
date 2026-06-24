import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Search, Star, Clock, MapPin, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RestaurantCardSkeleton from "../components/RestaurantCardSkeleton";
import { restaurants, categories } from "../data/mockData";

export default function RestaurantsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const filtered = restaurants.filter((r) => {
    const matchCategory =
      activeCategory === "All" || r.category === activeCategory;
    const matchSearch = r.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch && r.isOpen;
  });

  return (
    <div className="min-h-screen text-gray-900 font-sans">
      <Navbar />

      <section className="bg-gradient-to-b from-orange-50 to-white py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-2">
            <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">
              Gaza Strip
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-1">
              Restaurants Near You
            </h1>
            <p className="text-gray-500 mt-2 max-w-xl">
              Discover the best food your city has to offer — from local
              favourites to international cuisine.
            </p>
          </div>

          <div className="relative mt-6 max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white ring-1 ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 outline-none shadow-sm transition-all duration-300"
            />
          </div>
        </div>
      </section>

      <section className="sticky top-20 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("All")}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeCategory === "All"
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeCategory === cat.name
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <RestaurantCardSkeleton key={index} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg font-semibold">
                No restaurants found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Try a different category or search term
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((r) => (
                <NavLink
                  key={r.id}
                  to={`/restaurant/${r.id}`}
                  className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300"
                >
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {r.isFeatured && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold shadow-lg">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
                      {r.name}
                    </h3>

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="text-yellow-500 fill-yellow-500"
                        />
                        {r.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {r.deliveryTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {r.deliveryFee} ILS
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-400 font-semibold">
                        Min. {r.minOrder} ILS
                      </span>
                      <span className="text-orange-500 group-hover:translate-x-1 transition-transform duration-300">
                        <ChevronRight size={18} />
                      </span>
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
