import { useState } from "react";

const initialStats = {
  totalUsers: 1248,
  totalRestaurants: 48,
  pendingRestaurants: 6,
  totalDrivers: 93,
  pendingDrivers: 12,
  availableDrivers: 31,
  totalOrders: 572,
  revenue: 28540,
};

const initialUsers = [
  { id: 1, name: "Ahmed Hassan", email: "ahmed@example.com", role: "user", isActive: true, joined: "2025-01-15" },
  { id: 2, name: "Sara Khalil", email: "sara@example.com", role: "user", isActive: true, joined: "2025-02-20" },
  { id: 3, name: "Omar El-Masri", email: "omar@resto.com", role: "partner", isActive: true, joined: "2025-03-10" },
  { id: 4, name: "Layla Jaber", email: "layla@driver.com", role: "driver", isActive: false, joined: "2025-03-22" },
  { id: 5, name: "Khaled Abu Ali", email: "khaled@resto.com", role: "partner", isActive: true, joined: "2025-04-01" },
  { id: 6, name: "Mona Youssef", email: "mona@driver.com", role: "driver", isActive: true, joined: "2025-04-12" },
  { id: 7, name: "Tamer Nasser", email: "tamer@example.com", role: "user", isActive: true, joined: "2025-05-05" },
  { id: 8, name: "Dina Saleh", email: "dina@driver.com", role: "driver", isActive: true, joined: "2025-05-18" },
  { id: 9, name: "Rami Fawzi", email: "rami@resto.com", role: "partner", isActive: false, joined: "2025-06-01" },
  { id: 10, name: "Nour El-Din", email: "nour@example.com", role: "user", isActive: true, joined: "2025-06-14" },
];

const initialPendingRestaurants = [
  { id: 1, name: "Taste of Syria", owner: "Mohammed Al-Sayed", phone: "+970 59-123-4567", submitted: "2025-06-10", status: "pending" },
  { id: 2, name: "Mama's Kitchen", owner: "Fatima Khalil", phone: "+970 59-234-5678", submitted: "2025-06-11", status: "pending" },
  { id: 3, name: "Al-Baik Express", owner: "Hassan Omar", phone: "+970 59-345-6789", submitted: "2025-06-12", status: "pending" },
  { id: 4, name: "Green Bowl Salads", owner: "Lama Jaber", phone: "+970 59-456-7890", submitted: "2025-06-13", status: "pending" },
  { id: 5, name: "Spice Route", owner: "Yazan Mousa", phone: "+970 59-567-8901", submitted: "2025-06-14", status: "pending" },
  { id: 6, name: "Golden Fish", owner: "Samir Haddad", phone: "+970 59-678-9012", submitted: "2025-06-14", status: "pending" },
];

const initialDrivers = [
  { id: 1, name: "Karam Ali", email: "karam@driver.com", vehicle: "Honda CB125", phone: "+970 59-111-1111", isApproved: true, isAvailable: true, rating: 4.9 },
  { id: 2, name: "Mona Youssef", email: "mona@driver.com", vehicle: "Suzuki GS150", phone: "+970 59-222-2222", isApproved: true, isAvailable: false, rating: 4.7 },
  { id: 3, name: "Layla Jaber", email: "layla@driver.com", vehicle: "Yamaha MT-15", phone: "+970 59-333-3333", isApproved: false, isAvailable: false, rating: 0 },
  { id: 4, name: "Dina Saleh", email: "dina@driver.com", vehicle: "Honda CB200", phone: "+970 59-444-4444", isApproved: true, isAvailable: true, rating: 4.8 },
  { id: 5, name: "Rami Fawzi", email: "rami@driver.com", vehicle: "Bajaj Pulsar", phone: "+970 59-555-5555", isApproved: false, isAvailable: false, rating: 0 },
  { id: 6, name: "Nader Shahin", email: "nader@driver.com", vehicle: "TVS Apache", phone: "+970 59-666-6666", isApproved: false, isAvailable: false, rating: 0 },
  { id: 7, name: "Hiba Salman", email: "hiba@driver.com", vehicle: "Honda CB150", phone: "+970 59-777-7777", isApproved: true, isAvailable: true, rating: 5.0 },
  { id: 8, name: "Iyad Qasim", email: "iyad@driver.com", vehicle: "Suzuki GS150", phone: "+970 59-888-8888", isApproved: true, isAvailable: false, rating: 4.6 },
];

export function useAdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(initialStats);
  const [users, setUsers] = useState(initialUsers);
  const [pendingRestaurants, setPendingRestaurants] = useState(initialPendingRestaurants);
  const [drivers, setDrivers] = useState(initialDrivers);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleUserActive = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, isActive: !u.isActive } : u
      )
    );
  };

  const approveRestaurant = (id) => {
    setPendingRestaurants((prev) => prev.filter((r) => r.id !== id));
    setStats((prev) => ({
      ...prev,
      pendingRestaurants: prev.pendingRestaurants - 1,
      totalRestaurants: prev.totalRestaurants + 1,
    }));
  };

  const rejectRestaurant = (id) => {
    setPendingRestaurants((prev) => prev.filter((r) => r.id !== id));
    setStats((prev) => ({
      ...prev,
      pendingRestaurants: prev.pendingRestaurants - 1,
    }));
  };

  const approveDriver = (id) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, isApproved: true } : d
      )
    );
    setStats((prev) => ({
      ...prev,
      pendingDrivers: prev.pendingDrivers - 1,
    }));
  };

  const rejectDriver = (id) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    setStats((prev) => ({
      ...prev,
      pendingDrivers: prev.pendingDrivers - 1,
    }));
  };

  return {
    tab, setTab,
    stats,
    users, filteredUsers,
    pendingRestaurants,
    drivers,
    searchQuery, setSearchQuery,
    roleFilter, setRoleFilter,
    toggleUserActive,
    approveRestaurant, rejectRestaurant,
    approveDriver, rejectDriver,
  };
}
