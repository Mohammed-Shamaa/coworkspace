import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const usePartnerRegister = () => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    cuisine: "",
    address: "",
    vehicleType: "car",
    licenseNo: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [partnerType, setPartnerType] = useState("restaurant");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get("type");
    if (type === "driver" || type === "restaurant") {
      setPartnerType(type);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    console.log("Partner Registration Data Submitted:", formData);

    setTimeout(() => {
      setIsPending(false);
      setFormData({ name: "", email: "", password: "", phoneNumber: "", cuisine: "", address: "", vehicleType: "car", licenseNo: "" });
    }, 1000);
  };

  return {
    formData,
    showPassword,
    setShowPassword,
    partnerType,
    setPartnerType,
    isPending,
    error,
    setError,
    handleChange,
    handleSubmit
  }
}

export default usePartnerRegister;