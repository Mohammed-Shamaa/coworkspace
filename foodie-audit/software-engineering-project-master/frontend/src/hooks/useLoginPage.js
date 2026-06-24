import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function useLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    setTimeout(() => {
      setIsPending(false);
      if (formData.email === "admin@foodie.com" && formData.password === "Admin12345") {
        login({ name: "Admin", email: formData.email, role: "admin" });
        navigate("/admin/dashboard");
      } else if (formData.email === "partner@foodie.com" && formData.password === "Partner12345") {
        login({ name: "Omar", email: formData.email, role: "partner" });
        navigate("/partner/dashboard");
      } else if (formData.email === "driver@foodie.com" && formData.password === "Driver12345") {
        login({ name: "Karam", email: formData.email, role: "driver" });
        navigate("/driver/dashboard");
      } else if (formData.email === "test@foodie.com" && formData.password === "Test12345") {
        const name = formData.email.split("@")[0];
        login({ name, email: formData.email, role: "user" });
        navigate("/");
      } else {
        setError("Invalid email or password");
        setFormData({
          email: formData.email,
          password: ""
        });
      }
    }, 1000);
  };

  return {
    formData,
    showPassword,
    setShowPassword,
    isPending,
    error,
    handleChange,
    handleSubmit
  }
}