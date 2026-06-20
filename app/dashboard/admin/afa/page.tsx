"use client";

import { useState, useEffect } from "react";
import {
  Search, CheckCircle2, XCircle, ShoppingBag, Trash2, Copy, RefreshCw,
  CreditCard, Users, Star, ArrowLeftRight, MapPin, Smartphone, User as UserIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { toast } from "react-toastify";
import Loader from "../../loading";

export default function AdminAFAOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAFAOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/afa");
      if (res.ok) {
        setOrders(await res.json());
      } else {
        toast.error("Failed to load AFA orders");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error fetching AFA orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAFAOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setProcessingId(orderId);
    try {
      const res = await fetch("/api/admin/afa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, id: orderId }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map((o) => (o._id === orderId ? updatedOrder : o)));
        toast.success(`Order status updated to ${status}`);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error("Error: " + (data.error || "Failed to update status"));
      }
    } catch {
      toast.error("Error updating status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this AFA order?")) return;
    try {
      const res = await fetch(`/api/admin/afa?id=${orderId}`, { method: "DELETE" });
      if (res.ok) {
        setOrders(orders.filter((o) => o._id !== orderId));
        toast.success("AFA Order deleted successfully");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error("Failed to delete order: " + (data.error || "Unknown error"));
      }
    } catch {
      toast.error("Error deleting order");
    }
  };

  const filteredOrders = orders.filter((order) =>
    (order.transaction_id?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (order.user?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (order.fullName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (order.phoneNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (order.ghanaCard?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (order.location?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (order.status?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div>
        <h2 className="text-lg font-bold text-zinc-900">AFA Registration Orders</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Manage user AFA calltime registration details and updates</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-zinc-200 bg-white py-3">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-medium">Total Registrations</p>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">{orders.length}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Star size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white py-3">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-medium">Pending Processing</p>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">
                {orders.filter(o => o.status === "pending" || o.status === "processing").length}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <RefreshCw size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white py-3">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-medium">Completed</p>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">
                {orders.filter(o => o.status === "delivered" || o.status === "completed").length}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 bg-white overflow-hidden">
        <div className="p-4 md:p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white">
          <h3 className="text-base font-semibold text-zinc-900">
            AFA Orders <span className="text-zinc-400 font-normal text-sm">({filteredOrders.length})</span>
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Search AFA orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 focus:outline-none focus:border-slate-400 transition-colors w-full placeholder-zinc-400"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 font-medium whitespace-nowrap">
              <tr>
                <th className="px-6 py-4 border-b">Order ID</th>
                <th className="px-6 py-4 border-b">Submitted By</th>
                <th className="px-6 py-4 border-b">Registrant Info</th>
                <th className="px-6 py-4 border-b">Ghana Card</th>
                <th className="px-6 py-4 border-b">Location</th>
                <th className="px-6 py-4 border-b">Date</th>
                <th className="px-6 py-4 border-b">Status</th>
                <th className="px-6 py-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-500 max-w-[130px] truncate">
                        #{order.transaction_id}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(order.transaction_id)
                            .then(() => toast.success("Order ID copied!"))
                            .catch(() => toast.error("Failed to copy ID"));
                        }}
                        className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                        title="Copy transaction ID"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">{order.user?.name || "Unknown"}</span>
                      <span className="text-xs text-zinc-500">{order.user?.email || "No email"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-800">{order.fullName || "—"}</span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Smartphone size={12} className="text-zinc-400" />
                        <Link href={`https://wa.me/233${order.phoneNumber}`} target="_blank" className="hover:underline text-indigo-600">
                          {order.phoneNumber}
                        </Link>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-zinc-700">
                    {order.ghanaCard || "—"}
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={order.location}>
                    <span className="text-zinc-600 text-xs flex items-center gap-1">
                      <MapPin size={12} className="text-zinc-400 shrink-0" />
                      {order.location || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-zinc-600 text-xs">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          weekday: "short", month: "short", day: "numeric",
                        })}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      disabled={processingId === order._id}
                      className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 focus:outline-none transition-all shadow-sm
                        ${order.status === "delivered" || order.status === "completed" ? "bg-green-600 text-white border-green-700 hover:bg-green-700" :
                          order.status === "processing" ? "bg-blue-600 text-white border-blue-700 hover:bg-blue-700" :
                          order.status === "failed" ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" :
                          "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"}
                        ${processingId === order._id ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="pending" className="bg-white text-zinc-900">Pending</option>
                      <option value="processing" className="bg-white text-zinc-900">Processing</option>
                      <option value="delivered" className="bg-white text-zinc-900">Delivered</option>
                      <option value="completed" className="bg-white text-zinc-900">Completed</option>
                      <option value="failed" className="bg-white text-zinc-900">Failed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete AFA registration"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                    <ShoppingBag size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                    <p>No AFA registration orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card Layout */}
        <div className="lg:hidden space-y-4 p-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-zinc-500 max-w-[150px] truncate">
                      #{order.transaction_id}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(order.transaction_id)
                          .then(() => toast.success("Order ID copied!"))
                          .catch(() => toast.error("Failed to copy ID"));
                      }}
                      className="p-1 rounded hover:bg-zinc-100 text-zinc-400"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  <h4 className="font-bold text-zinc-900 text-sm mt-1">{order.fullName || "—"}</h4>
                  <p className="text-xs text-zinc-500">{order.phoneNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    By: {order.user?.name || "Unknown"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-zinc-100 py-2.5">
                <div>
                  <p className="text-zinc-400">Ghana Card</p>
                  <p className="font-semibold text-zinc-800 font-mono text-xs">{order.ghanaCard || "—"}</p>
                </div>
                <div>
                  <p className="text-zinc-400">Location</p>
                  <p className="font-semibold text-zinc-700 truncate" title={order.location}>{order.location || "—"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                  disabled={processingId === order._id}
                  className={`w-full cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border-2 focus:outline-none transition-all
                    ${order.status === "delivered" || order.status === "completed" ? "bg-green-600 text-white border-green-700 hover:bg-green-700" :
                      order.status === "processing" ? "bg-blue-600 text-white border-blue-700 hover:bg-blue-700" :
                      order.status === "failed" ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" :
                      "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"}
                    ${processingId === order._id ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="pending" className="bg-white text-zinc-900">Pending</option>
                  <option value="processing" className="bg-white text-zinc-900">Processing</option>
                  <option value="delivered" className="bg-white text-zinc-900">Delivered</option>
                  <option value="completed" className="bg-white text-zinc-900">Completed</option>
                  <option value="failed" className="bg-white text-zinc-900">Failed</option>
                </select>

                <button
                  onClick={() => handleDeleteOrder(order._id)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-zinc-200 hover:border-red-100 transition-all shrink-0"
                  title="Delete registration"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="py-12 text-center text-zinc-500">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
              <p>No AFA registration orders found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
