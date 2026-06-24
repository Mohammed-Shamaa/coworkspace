import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function useSignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

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

    setTimeout(() => {
      setIsPending(false);
      login({ name: formData.name, email: formData.email });
      navigate("/login");
    }, 1000);
  };

  return {
    formData,
    showPassword,
    isPending,
    error,
    handleChange,
    handleSubmit,
    setShowPassword
  };
}