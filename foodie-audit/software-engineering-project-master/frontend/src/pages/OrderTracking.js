import { useParams } from "react-router-dom";
import {
  CheckCircle,
  ChefHat,
  Bike,
  Package,
  MapPin,
} from "lucide-react";
import Navbar from "../components/Navbar";

const steps = [
  { id: 1, label: "Order Placed", time: "12:30 PM", icon: Package },
  { id: 2, label: "Preparing", time: "12:35 PM", icon: ChefHat },
  { id: 3, label: "Picked Up", time: "12:50 PM", icon: Bike },
  { id: 4, label: "Delivered", time: "01:10 PM", icon: MapPin },
];

const currentStep = 2;

export default function OrderTrackingPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen text-gray-900 font-sans bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-400 font-semibold">
                Order #{id}
              </p>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">
                Al-Mostaqim Pizza
              </h2>
            </div>
            <span className="px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-bold">
              In Progress
            </span>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gray-200" />

            <div className="space-y-8 relative">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div key={step.id} className="flex items-start gap-4">
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-orange-500 text-white ring-4 ring-orange-100"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle size={20} />
                      ) : (
                        <StepIcon size={18} />
                      )}
                    </div>

                    <div className="pt-1.5">
                      <p
                        className={`font-bold text-sm ${
                          isCompleted || isCurrent
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          isCompleted || isCurrent
                            ? "text-gray-500"
                            : "text-gray-300"
                        }`}
                      >
                        {step.time}
                      </p>
                      {isCurrent && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                          <span className="text-xs text-orange-500 font-semibold">
                            In progress
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h3 className="font-bold text-gray-900 mb-4">Delivery Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Delivering to</p>
                <p className="text-gray-500">
                  Omar Mukhtar St, Al-Rimal, Gaza
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Bike size={16} className="text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Your Rider</p>
                <p className="text-gray-500">Ahmed — +970 59 123 4567</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ChefHat size={16} className="text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Restaurant</p>
                <p className="text-gray-500">Al-Mostaqim Pizza</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
