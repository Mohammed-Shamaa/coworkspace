import { useState } from "react";

// payout stored as number, currency separate
const initialOrders = [
  { id: "#FD-9901", restaurant: "Captain Gate Kitchen", address: "University Street - Block C", distance: "1.2 km", payout: 12 },
  { id: "#FD-9902", restaurant: "Pizza Hut", address: "Main Square - Al-Amal Tower", distance: "3.5 km", payout: 15 },
  { id: "#FD-9903", restaurant: "Burger King", address: "Industrial Zone - Market Lane", distance: "4.8 km", payout: 18 },
];

export function useDriverDashboard() {
  const [tab, setTab] = useState("available");
  const [availableOrders, setAvailableOrders] = useState(initialOrders);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(4);
  const [earnings, setEarnings] = useState(58);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const acceptOrder = (order) => {
    setCurrentOrder(order);
    setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
    setTab("active");
    setStep(1);
  };

  const nextStep = () => {
    if (step === 1) {
      setStep(2);
    } else {
      setEarnings(prev => prev + currentOrder.payout);
      setDone(prev => prev + 1);
      setCurrentOrder(null);
      setTab("earnings");
    }
  };

  // removed window.confirm — UI handles confirmation dialog
  const requestCancel = () => setShowCancelConfirm(true);

  const confirmCancel = () => {
    setAvailableOrders(prev => [...prev, currentOrder]);
    setCurrentOrder(null);
    setShowCancelConfirm(false);
    setTab("available");
  };

  const dismissCancel = () => setShowCancelConfirm(false);

  return {
    tab,
    setTab,
    availableOrders,
    currentOrder,
    step,
    done,
    earnings,
    showCancelConfirm,
    acceptOrder,
    nextStep,
    requestCancel,
    confirmCancel,
    dismissCancel,
  };
}
