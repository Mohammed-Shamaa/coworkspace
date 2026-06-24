import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ButtonBack() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="group mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-orange-500 transition-colors"
    >
      <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
      Back
    </button>
  )
}