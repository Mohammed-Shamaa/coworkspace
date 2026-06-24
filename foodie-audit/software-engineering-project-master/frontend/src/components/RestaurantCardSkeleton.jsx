export default function RestaurantCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm animate-pulse">
      {/* Image placeholder */}
      <div className="relative h-44 bg-gray-200">
        {/* Featured badge placeholder */}
        <div className="absolute top-3 left-3 w-20 h-6 rounded-full bg-gray-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Restaurant name */}
        <div className="h-5 w-3/4 bg-gray-200 rounded-lg" />

        {/* Rating, delivery time, delivery fee */}
        <div className="flex items-center gap-4 mt-3">
          <div className="h-4 w-12 bg-gray-200 rounded-md" />
          <div className="h-4 w-16 bg-gray-200 rounded-md" />
          <div className="h-4 w-16 bg-gray-200 rounded-md" />
        </div>

        {/* Min order + arrow */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="h-3 w-24 bg-gray-200 rounded-md" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
