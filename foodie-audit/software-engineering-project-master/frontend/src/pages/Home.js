import { NavLink } from "react-router-dom";
import {
  Timer,
  ArrowRight,
  ChefHat,
  Truck,
  Store,
  Users,
  Star,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: <ChefHat size={26} />,
    title: "Top-Rated Kitchens",
    description:
      "Handpicked local restaurants known for hygiene, speed, and premium taste.",
  },
  {
    icon: <Timer size={26} />,
    title: "On-Time Delivery",
    description:
      "Optimized logistics ensure your food arrives warm, fresh, and right on time.",
  },
  {
    icon: <Truck size={26} />,
    title: "24/7 Support",
    description:
      "Available round the clock to assist you with any issues.",
  },
];

const stats = [
  {
    icon: <Store size={26} />,
    value: "500+",
    label: "Partner Restaurants",
  },
  {
    icon: <Users size={26} />,
    value: "10,000+",
    label: "Happy Customers",
  },
  {
    icon: <Star size={26} />,
    value: "4.8",
    label: "Average Rating",
  },
  {
    icon: <ShieldCheck size={26} />,
    value: "Secure",
    label: "Payments & Checkout",
  },
];

export default function HomePage() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen text-gray-900 font-sans">

      <Navbar />
      <main>
        <section className="relative py-16 md:py-24 bg-orange-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div className="space-y-8">
                <div className="space-y-5">
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.05]">
                    Delicious Food,
                    <br />
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                      Delivered Fast
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
                    Order from the city's best restaurants and enjoy hot,
                    delicious meals delivered to your doorstep in minutes.
                  </p>
                </div>

                {!user && <div className="flex flex-col sm:flex-row gap-4">
                  <NavLink
                    to="/signup"
                    className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base transition-all duration-300"
                  >
                    Get Started
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </NavLink>

                  <NavLink
                    to="/partner/register"
                    className="inline-flex items-center justify-center px-7 py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 hover:border-orange-500 hover:text-orange-500 font-bold text-base shadow-sm transition-all duration-300"
                  >
                    Become a Partner
                  </NavLink>
                </div>}
              </div>

              <div className="relative flex justify-center">
                <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-orange-100 rounded-[2.5rem] p-6 md:p-8">
                  <img
                    src="/hero.png"
                    alt="Delicious food"
                    className="w-full max-w-md object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">
                Designed for Everyday Convenience
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We focus on delivering high-quality meals quickly, safely, and
                effortlessly.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group bg-white border border-gray-100 hover:border-orange-500 rounded-3xl p-8 shadow-sm transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center mb-6 transition-transform duration-300">
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors duration-300 mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 border-t border-gray-100 bg-orange-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">
                Trusted by Thousands
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Numbers that reflect our commitment to quality, speed, and customer
                satisfaction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="group relative bg-white border border-gray-100 hover:border-orange-500 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center mx-auto mb-5 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                    {stat.icon}
                  </div>

                  <p className="text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors duration-300 mb-2">
                    {stat.value}
                  </p>

                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-orange-100/80 text-gray-900 p-10 md:p-16 shadow-xl shadow-orange-500/5">
              <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="max-w-2xl text-center lg:text-left">
                  <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-4">
                    Join FoodieDelivery
                  </span>

                  <h3 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4 text-gray-900">
                    Grow Your Business With Us
                  </h3>

                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    Whether you own a restaurant or want to earn as a rider,
                    join our platform and reach thousands of hungry customers.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <NavLink
                    to="/partner/register?type=restaurant"
                    className="px-6 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-center shadow-lg shadow-orange-500/20 transition-all duration-300"
                  >
                    Register Kitchen
                  </NavLink>

                  <NavLink
                    to="/partner/register?type=driver"
                    className="px-6 py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 font-bold text-center shadow-sm transition-all duration-300"
                  >
                    Join as Rider
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}