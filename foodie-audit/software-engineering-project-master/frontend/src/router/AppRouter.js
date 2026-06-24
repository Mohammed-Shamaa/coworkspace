import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/Login";
import SignupPage from "../pages/Signup";
import PartnerRegisterPage from "../pages/PartnerRegister";
import HomePage from "../pages/Home";
import NotFoundPage from "../pages/NotFound";
import RestaurantsPage from "../pages/Restaurants";
import RestaurantMenuPage from "../pages/RestaurantMenu";
import CartPage from "../pages/Cart";
import CheckoutPage from "../pages/Checkout";
import OrderTrackingPage from "../pages/OrderTracking";
import AdminDashboardPage from "../pages/AdminDashboard";
import PartnerDashboardPage from "../pages/PartnerDashboard";
import DriverDashboardPage from "../pages/DriverDashboard";
import ProtectedRoutes from "./ProtectedRoutes";
import NotAuthorization from "../pages/NotAuthorization";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/partner/register" element={<PartnerRegisterPage />} />
      <Route path="/restaurants" element={<RestaurantsPage />} />
      <Route path="/restaurant/:id" element={<RestaurantMenuPage />} />
      <Route
        path="/cart"
        element={
          <ProtectedRoutes allowedRoles={["user"]}>
            <CartPage />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoutes allowedRoles={["user"]}>
            <CheckoutPage />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoutes allowedRoles={["user"]}>
            <OrderTrackingPage />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoutes allowedRoles={["admin"]}>
            <AdminDashboardPage />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/partner/dashboard"
        element={
          <ProtectedRoutes allowedRoles={["partner"]}>
            <PartnerDashboardPage />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/driver/dashboard"
        element={
          <ProtectedRoutes allowedRoles={["driver"]}>
            <DriverDashboardPage />
          </ProtectedRoutes>
        }
      />
      <Route path="/not-authorized" element={<NotAuthorization />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
