"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Search, Users, UserPlus, Wallet, X, Trash2, Shield, ArrowLeft, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { toast } from "react-toastify";
import Loader from "../../loading";

export default function AdminUsersPage() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSortByAgentsFirst, setUserSortByAgentsFirst] = useState(false);

  // Top-up modal
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [topUpAmount, setTopUpAmount] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) setUsers(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: string, userName: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change ${userName}'s role to ${newRole}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
        toast.success(`${userName}'s role has been updated to ${newRole}!`);
      } else {
        toast.error(data.message || `Failed to update role to ${newRole}`);
      }
    } catch {
      toast.error("Error updating user role");
    }
  };

  const handleMakeAgent = (userId: string, userName: string) => handleUpdateRole(userId, userName, "agent");
  const handleMakeAdmin = (userId: string, userName: string) => handleUpdateRole(userId, userName, "admin");
  const handleMakeUser = (userId: string, userName: string) => handleUpdateRole(userId, userName, "user");

  const handleTopUpUser = async () => {
    if (!selectedUser || !topUpAmount) { toast.warn("Please enter an amount"); return; }
    const amount = parseFloat(topUpAmount);
    if (amount <= 0) { toast.warn("Amount must be greater than 0"); return; }
    try {
      const res = await fetch("/api/adminTopUp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser._id, amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map((u) => (u._id === selectedUser._id ? { ...u, walletBalance: data.user.walletBalance } : u)));
        toast.success(`Successfully added ${formatCurrency(amount)} to ${selectedUser.name}'s wallet!`);
        setTopUpModalOpen(false);
        setSelectedUser(null);
        setTopUpAmount("");
      } else {
        toast.error(data.message || "Failed to top up user balance");
      }
    } catch {
      toast.error("Error topping up user balance");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${userName}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.filter((u) => u._id !== userId));
        toast.success(`${userName} has been successfully deleted.`);
      } else {
        toast.error(data.error || "Failed to delete user");
      }
    } catch {
      toast.error("Error deleting user");
    }
  };

  const openTopUpModal = (user: any) => { setSelectedUser(user); setTopUpModalOpen(true); };
  const closeTopUpModal = () => { setTopUpModalOpen(false); setSelectedUser(null); setTopUpAmount(""); };

  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase() || "").includes(userSearchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(userSearchQuery.toLowerCase()) ||
      (user.role?.toLowerCase() || "").includes(userSearchQuery.toLowerCase())
  );

  const agentCount = users.filter((u) => u.role === "agent").length;

  const displayedUsers = userSortByAgentsFirst
    ? [...filteredUsers].sort((a, b) => {
        if (a.role === "agent" === (b.role === "agent")) return 0;
        return a.role === "agent" ? -1 : 1;
      })
    : filteredUsers;

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-1 mb-6">
        {[
          { href: "/dashboard/admin/orders", label: "Manage Orders", icon: ShoppingBag },
          { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
          { href: "/dashboard/admin/bundles", label: "Manage Bundles", icon: Shield },
        ].map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px
                ${isActive
                  ? "border-purple-600 text-purple-600 font-bold"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"}`}
            >
              <Icon size={16} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-bold text-zinc-900">Users</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Manage registered users and roles</p>
      </div>

      <Card className="border-zinc-200 bg-white overflow-hidden">
        <div className="p-4 md:p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">Registered Users</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Agents: <span className="font-semibold text-green-600">{agentCount}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 focus:outline-none focus:border-slate-400 transition-colors w-full placeholder-zinc-400"
              />
            </div>
            <button
              onClick={() => setUserSortByAgentsFirst((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 transition-colors whitespace-nowrap"
            >
              <Users size={14} />
              {userSortByAgentsFirst ? "Default" : "Agents first"}
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Wallet Balance</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {displayedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase
                      ${user.role === "admin" ? "bg-purple-100 text-purple-700 border border-purple-200" :
                        user.role === "agent" ? "bg-green-100 text-green-700 border border-green-200" :
                         user.role === "moderator" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                          "bg-zinc-100 text-zinc-600 border border-zinc-200"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-zinc-900">{formatCurrency(user.walletBalance || 0)}</td>
                  <td className="px-6 py-4 text-zinc-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end flex-wrap">
                      {user.role === "user" && (
                        <>
                          <button
                            onClick={() => handleMakeAgent(user._id, user.name)}
                            className="p-2 text-green-600 hover:text-white hover:bg-green-600 border border-green-600 rounded-lg transition-all"
                            title="Promote to Agent"
                          >
                            <UserPlus size={16} />
                          </button>
                          <button
                            onClick={() => handleMakeAdmin(user._id, user.name)}
                            className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded-lg transition-all"
                            title="Promote to Admin"
                          >
                            <Shield size={16} />
                          </button>
                        </>
                      )}
                      {((user.role === "agent" || user.role === "admin") && user._id !== currentUserId) && (
                        <button
                          onClick={() => handleMakeUser(user._id, user.name)}
                          className="p-2 text-orange-600 hover:text-white hover:bg-orange-600 border border-orange-600 rounded-lg transition-all"
                          title="Demote to User"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => openTopUpModal(user)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:text-white hover:bg-slate-600 border border-slate-600 rounded-lg transition-all text-sm font-medium"
                      >
                        <Wallet size={16} /> Top Up
                      </button>
                      {user._id !== currentUserId && (
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <Users size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 p-4">
          {displayedUsers.map((user) => (
            <div key={user._id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center text-sm font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight
                  ${user.role === "admin" ? "bg-purple-100 text-purple-700 border border-purple-200" :
                    user.role === "agent" ? "bg-green-100 text-green-700 border border-green-200" :
                      user.role === "moderator" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                        "bg-zinc-100 text-zinc-600 border border-zinc-200"}`}>
                  {user.role}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <p className="text-zinc-500 text-xs">Wallet Balance</p>
                  <p className="font-semibold text-zinc-900">{formatCurrency(user.walletBalance || 0)}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Joined</p>
                  <p className="text-zinc-700">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-3 border-t border-zinc-100">
                {user.role === "user" && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleMakeAgent(user._id, user.name)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 hover:text-white hover:bg-green-600 border border-green-600 rounded-lg transition-all"
                    >
                      <UserPlus size={14} /> Make Agent
                    </button>
                    <button
                      onClick={() => handleMakeAdmin(user._id, user.name)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded-lg transition-all"
                    >
                      <Shield size={14} /> Make Admin
                    </button>
                  </div>
                )}
                {((user.role === "agent" || user.role === "admin") && user._id !== currentUserId) && (
                  <button
                    onClick={() => handleMakeUser(user._id, user.name)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 hover:text-white hover:bg-orange-600 border border-orange-600 rounded-lg transition-all"
                  >
                    <X size={14} /> Demote to User
                  </button>
                )}
                <button
                  onClick={() => openTopUpModal(user)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-slate-600 hover:text-white hover:bg-slate-600 border border-slate-600 rounded-lg transition-all text-sm font-medium"
                >
                  <Wallet size={16} /> Top Up Balance
                </button>
                {user._id !== currentUserId && (
                  <button
                    onClick={() => handleDeleteUser(user._id, user.name)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-all text-sm font-medium"
                  >
                    <Trash2 size={16} /> Delete User
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-zinc-500">
              <Users size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
              <p>No users found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Top-Up Modal */}
      {topUpModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in fade-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900">Top Up User Balance</h3>
              <button onClick={closeTopUpModal} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-zinc-50 p-4 rounded-xl">
                <p className="text-sm text-zinc-500 mb-1">User</p>
                <p className="font-semibold text-zinc-900">{selectedUser.name}</p>
                <p className="text-sm text-zinc-500">{selectedUser.email}</p>
                <p className="text-sm text-zinc-600 mt-2">
                  Current Balance:{" "}
                  <span className="font-bold text-slate-600">{formatCurrency(selectedUser.walletBalance || 0)}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Amount to Add (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:border-slate-400 transition-colors"
                />
              </div>
              {topUpAmount && parseFloat(topUpAmount) > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-600">
                    New Balance:{" "}
                    <span className="font-bold">
                      {formatCurrency((selectedUser.walletBalance || 0) + parseFloat(topUpAmount))}
                    </span>
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeTopUpModal}
                  className="flex-1 px-4 py-3 border border-zinc-300 text-zinc-700 rounded-xl hover:bg-zinc-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTopUpUser}
                  className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
                >
                  Confirm Top Up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
