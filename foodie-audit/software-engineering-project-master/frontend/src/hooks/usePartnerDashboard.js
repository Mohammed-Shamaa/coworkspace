import { useState } from "react";

const initialOrders = [
  { id: "#FD-1082", customer: "Ahmed", items: "2x Classic Burger, 1x Family Fries", total: "45 ILS", status: "Pending" },
  { id: "#FD-1081", customer: "Ali", items: "1x Medium Veggie Pizza, 1x Coca-Cola", total: "38 ILS", status: "Preparing" },
  { id: "#FD-1080", customer: "Mahmoud", items: "3x Shawarma Meal", total: "75 ILS", status: "With Rider" },
];

const initialMenu = [
  { id: 1, name: "Classic Burger", price: 20, category: "Burgers", available: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150" },
  { id: 2, name: "Pizza Italiano", price: 35, category: "Pizza", available: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150" },
  { id: 3, name: "Crispy Fries", price: 12, category: "Sides", available: false, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=150" },
];

export function usePartnerDashboard() {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState(initialOrders);
  const [menuItems, setMenuItems] = useState(initialMenu);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("Burgers");

  // removed window.confirm — UI handles confirmation dialog
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const updateStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const toggleItem = (id) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, available: !item.available } : item));
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormPrice("");
    setFormCategory("Burgers");
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormPrice(String(item.price));
    setFormCategory(item.category);
    setIsModalOpen(true);
  };

  const requestDelete = (id) => setDeleteTargetId(id);

  const confirmDelete = () => {
    setMenuItems(prev => prev.filter(item => item.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  const dismissDelete = () => setDeleteTargetId(null);

  // e.preventDefault moved to the component's onSubmit handler
  const saveItem = () => {
    if (editingItem) {
      setMenuItems(prev => prev.map(item =>
        item.id === editingItem.id
          ? { ...item, name: formName, price: parseInt(formPrice, 10), category: formCategory }
          : item
      ));
    } else {
      setMenuItems(prev => [...prev, {
        id: crypto.randomUUID(),   // safer than Date.now()
        name: formName,
        price: parseInt(formPrice, 10),
        category: formCategory,
        available: true,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150"
      }]);
    }
    setIsModalOpen(false);
  };

  return {
    tab,
    setTab,
    orders,
    menuItems,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    formName,
    setFormName,
    formPrice,
    setFormPrice,
    formCategory,
    setFormCategory,
    deleteTargetId,
    updateStatus,
    toggleItem,
    openAdd,
    openEdit,
    requestDelete,
    confirmDelete,
    dismissDelete,
    saveItem,
  };
}
