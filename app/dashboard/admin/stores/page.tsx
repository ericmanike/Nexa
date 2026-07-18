"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Store,
  ExternalLink,
  Package,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Phone,
  Mail,
  User as UserIcon,
  ShoppingBag,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { toast } from "react-toastify";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "sales" | "name">("newest");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // View Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedStoreData, setSelectedStoreData] = useState<any>(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    storeName: "",
    slug: "",
    description: "",
    whatsappSupport: "",
    isActive: true,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingStore, setDeletingStore] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stores");
      if (res.ok) {
        const data = await res.json();
        setStores(data);
      } else {
        toast.error("Failed to load agent stores");
      }
    } catch (e) {
      console.error("Failed to fetch stores:", e);
      toast.error("Error fetching agent stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Toggle store active status
  const handleToggleActive = async (store: any) => {
    const newStatus = !store.isActive;
    setTogglingId(store._id);
    try {
      const res = await fetch(`/api/admin/stores/${store._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setStores((prev) =>
          prev.map((s) => (s._id === store._id ? { ...s, isActive: newStatus } : s))
        );
        toast.success(
          `Store "${store.storeName}" has been ${newStatus ? "activated" : "deactivated"}!`
        );
      } else {
        toast.error(data.error || "Failed to update store status");
      }
    } catch (error) {
      toast.error("Error updating store status");
    } finally {
      setTogglingId(null);
    }
  };

  // Open View Modal
  const handleOpenViewModal = async (storeId: string) => {
    setViewModalOpen(true);
    setViewLoading(true);
    setSelectedStoreData(null);
    try {
      const res = await fetch(`/api/admin/stores/${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedStoreData(data);
      } else {
        toast.error("Failed to load detailed store information");
      }
    } catch (error) {
      toast.error("Error fetching store details");
    } finally {
      setViewLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (store: any) => {
    setEditingStore(store);
    setEditForm({
      storeName: store.storeName || "",
      slug: store.slug || "",
      description: store.description || "",
      whatsappSupport: store.whatsappSupport || "",
      isActive: Boolean(store.isActive),
    });
    setEditModalOpen(true);
  };

  // Save Edit Form
  const handleSaveEdit = async () => {
    if (!editForm.storeName.trim()) {
      toast.warn("Store name is required");
      return;
    }
    if (!editForm.slug.trim()) {
      toast.warn("Store slug is required");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/stores/${editingStore._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (res.ok) {
        setStores((prev) =>
          prev.map((s) => (s._id === editingStore._id ? { ...s, ...data.store } : s))
        );
        toast.success(`Store "${data.store.storeName}" updated successfully!`);
        setEditModalOpen(false);
        setEditingStore(null);
      } else {
        toast.error(data.error || "Failed to update store");
      }
    } catch (error) {
      toast.error("Error saving store changes");
    } finally {
      setSavingEdit(false);
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (store: any) => {
    setDeletingStore(store);
    setDeleteModalOpen(true);
  };

  // Confirm Delete Store
  const handleConfirmDelete = async () => {
    if (!deletingStore) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/stores/${deletingStore._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setStores((prev) => prev.filter((s) => s._id !== deletingStore._id));
        toast.success(`Store "${deletingStore.storeName}" deleted successfully.`);
        setDeleteModalOpen(false);
        setDeletingStore(null);
      } else {
        toast.error(data.error || "Failed to delete store");
      }
    } catch (error) {
      toast.error("Error deleting store");
    } finally {
      setDeleting(false);
    }
  };

  // Derived Metrics
  const totalStores = stores.length;
  const activeStores = stores.filter((s) => s.isActive).length;
  const inactiveStores = totalStores - activeStores;
  const totalSalesCount = stores.reduce((acc, s) => acc + (s.totalSalesCount || 0), 0);

  // Filtered and Sorted Stores
  const filteredStores = stores
    .filter((store) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        (store.storeName?.toLowerCase() || "").includes(query) ||
        (store.slug?.toLowerCase() || "").includes(query) ||
        (store.user?.name?.toLowerCase() || "").includes(query) ||
        (store.user?.email?.toLowerCase() || "").includes(query);

      if (!matchesSearch) return false;

      if (statusFilter === "active") return store.isActive;
      if (statusFilter === "inactive") return !store.isActive;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "sales") return (b.totalSalesCount || 0) - (a.totalSalesCount || 0);
      if (sortBy === "name") return (a.storeName || "").localeCompare(b.storeName || "");
      return 0;
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-600" />
        <p className="text-sm text-zinc-500 font-medium">Loading agent stores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Agent Stores</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Monitor, manage, and update agent storefronts and pricing
          </p>
        </div>
        <button
          onClick={fetchStores}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-slate-600" : "text-zinc-500"} />
          Refresh Stores
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="p-4 bg-white border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Active</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{activeStores}</p>
        </Card>

        <Card className="p-4 bg-white border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Inactive</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <XCircle size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{inactiveStores}</p>
        </Card>

        <Card className="p-4 bg-white border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Package size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">{totalSalesCount}</p>
        </Card>
      </div>

      {/* Table Container */}
      <Card className="border-zinc-200 bg-white overflow-hidden shadow-sm">
        {/* Controls Bar */}
        <div className="p-4 md:p-5 border-b border-zinc-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Search by store name, slug, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-900 focus:outline-none focus:border-slate-400 transition-colors w-full placeholder-zinc-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Tabs */}
            <div className="flex items-center bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === "all" ? "bg-white text-zinc-900 shadow-xs font-bold" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                All ({stores.length})
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === "active" ? "bg-white text-emerald-700 shadow-xs font-bold" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Active ({activeStores})
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === "inactive" ? "bg-white text-rose-700 shadow-xs font-bold" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Inactive ({inactiveStores})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl text-xs text-zinc-600 font-medium">
              <ArrowUpDown size={14} className="text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs font-semibold text-zinc-800 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="sales">Most Sales</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Store Details</th>
                <th className="px-6 py-4">Owner Account</th>
                <th className="px-6 py-4">Sales</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredStores.map((store) => (
                <tr key={store._id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-xs border border-slate-200 shrink-0">
                        <Store size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900 text-sm truncate">{store.storeName}</p>
                        <p className="text-xs text-slate-600 font-mono">/{store.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900">{store.user?.name || "Unknown Owner"}</span>
                      <span className="text-xs text-zinc-500">{store.user?.email || "No email"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-800">
                      <Package size={14} className="text-zinc-400" />
                      {store.totalSalesCount || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(store)}
                      disabled={togglingId === store._id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
                        store.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      }`}
                      title="Click to toggle store active status"
                    >
                      {togglingId === store._id ? (
                        <div className="animate-spin h-3 w-3 border-b-2 border-current rounded-full" />
                      ) : store.isActive ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <XCircle size={13} />
                      )}
                      {store.isActive ? "Active" : "Suspended"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-xs">
                    {new Date(store.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenViewModal(store._id)}
                        className="p-2 text-zinc-600 hover:text-slate-700 hover:bg-zinc-100 rounded-lg transition-colors"
                        title="View Full Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(store)}
                        className="p-2 text-zinc-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Store Settings"
                      >
                        <Edit size={16} />
                      </button>
                      <Link
                        href={`/store/${store.slug}`}
                        target="_blank"
                        className="p-2 text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Open Public Storefront"
                      >
                        <ExternalLink size={16} />
                      </Link>
                      <button
                        onClick={() => handleOpenDeleteModal(store)}
                        className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Store"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStores.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-zinc-500">
                    <Store size={36} className="mx-auto mb-3 opacity-30 text-zinc-400" />
                    <p className="font-semibold text-zinc-700">No stores found</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Try updating your search query or status filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="lg:hidden divide-y divide-zinc-100">
          {filteredStores.map((store) => (
            <div key={store._id} className="p-4 space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100 shrink-0">
                    <Store size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 text-sm">{store.storeName}</p>
                    <p className="text-xs text-slate-600 font-mono">/{store.slug}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{store.user?.name || "Unknown Owner"}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActive(store)}
                  disabled={togglingId === store._id}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                    store.isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {store.isActive ? "Active" : "Suspended"}
                </button>
              </div>

              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-xs flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Total Sales</span>
                <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                  <Package size={14} className="text-zinc-400" />
                  {store.totalSalesCount || 0} sales
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-zinc-400 text-[11px]">
                  Created {new Date(store.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenViewModal(store._id)}
                    className="px-2.5 py-1.5 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-lg font-semibold text-xs transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(store)}
                    className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold text-xs transition-colors"
                  >
                    Edit
                  </button>
                  <Link
                    href={`/store/${store.slug}`}
                    target="_blank"
                    className="p-1.5 text-slate-700 hover:bg-zinc-100 rounded-lg border border-zinc-200"
                  >
                    <ExternalLink size={14} />
                  </Link>
                  <button
                    onClick={() => handleOpenDeleteModal(store)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredStores.length === 0 && (
            <div className="py-12 text-center text-zinc-500">
              <Store size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
              <p className="font-semibold text-zinc-700">No stores found</p>
            </div>
          )}
        </div>
      </Card>

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-lg">Agent Store Details</h3>
                  <p className="text-xs text-zinc-500">Full storefront configuration & history</p>
                </div>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {viewLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
                  <p className="text-xs text-zinc-500 font-medium">Fetching store metadata...</p>
                </div>
              ) : selectedStoreData ? (
                <>
                  {/* Overview Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Store Card */}
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Storefront</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                            selectedStoreData.store.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {selectedStoreData.store.isActive ? "Active" : "Suspended"}
                        </span>
                      </div>
                      <p className="font-extrabold text-zinc-900 text-base">{selectedStoreData.store.storeName}</p>
                      <p className="text-xs text-slate-600 font-mono">Link: /{selectedStoreData.store.slug}</p>
                      {selectedStoreData.store.description && (
                        <p className="text-xs text-zinc-600 italic bg-white p-2 rounded-lg border border-zinc-100 mt-2">
                          "{selectedStoreData.store.description}"
                        </p>
                      )}
                      {selectedStoreData.store.whatsappSupport && (
                        <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 pt-1">
                          <Phone size={13} /> WhatsApp Support: {selectedStoreData.store.whatsappSupport}
                        </p>
                      )}
                    </div>

                    {/* Owner Card */}
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Owner Account</span>
                      <p className="font-extrabold text-zinc-900 text-base">
                        {selectedStoreData.store.user?.name || "N/A"}
                      </p>
                      <div className="space-y-1 text-xs text-zinc-600">
                        <p className="flex items-center gap-1.5">
                          <Mail size={13} className="text-zinc-400" /> {selectedStoreData.store.user?.email}
                        </p>
                        {selectedStoreData.store.user?.phone && (
                          <p className="flex items-center gap-1.5">
                            <Phone size={13} className="text-zinc-400" /> {selectedStoreData.store.user?.phone}
                          </p>
                        )}
                        <p className="flex items-center gap-1.5">
                          <UserIcon size={13} className="text-zinc-400" /> Role:{" "}
                          <span className="font-semibold uppercase text-slate-700">
                            {selectedStoreData.store.user?.role}
                          </span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          Wallet Balance:{" "}
                          <span className="font-bold text-emerald-600">
                            {formatCurrency(selectedStoreData.store.user?.walletBalance || 0)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Custom Bundle Pricing Configured */}
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 mb-2.5 flex items-center gap-2">
                      <ShoppingBag size={16} className="text-slate-600" />
                      Agent Custom Package Prices ({selectedStoreData.storeBundles?.length || 0})
                    </h4>
                    {selectedStoreData.storeBundles && selectedStoreData.storeBundles.length > 0 ? (
                      <div className="overflow-x-auto border border-zinc-200 rounded-xl">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-zinc-50 text-zinc-500 font-semibold uppercase">
                            <tr>
                              <th className="px-4 py-2.5">Package</th>
                              <th className="px-4 py-2.5">Network</th>
                              <th className="px-4 py-2.5">Base Price</th>
                              <th className="px-4 py-2.5">Custom Price</th>
                              <th className="px-4 py-2.5">Margin / Unit</th>
                              <th className="px-4 py-2.5 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {selectedStoreData.storeBundles.map((sb: any) => {
                              const margin = sb.customPrice - sb.basePrice;
                              return (
                                <tr key={sb._id} className="hover:bg-zinc-50">
                                  <td className="px-4 py-2.5 font-bold text-zinc-900">
                                    {sb.bundle?.name || "Deleted Bundle"}
                                  </td>
                                  <td className="px-4 py-2.5 uppercase font-medium text-zinc-600">
                                    {sb.bundle?.network || "-"}
                                  </td>
                                  <td className="px-4 py-2.5 text-zinc-600">
                                    {formatCurrency(sb.basePrice)}
                                  </td>
                                  <td className="px-4 py-2.5 font-bold text-zinc-900">
                                    {formatCurrency(sb.customPrice)}
                                  </td>
                                  <td className="px-4 py-2.5 font-bold text-emerald-600">
                                    +{formatCurrency(margin)}
                                  </td>
                                  <td className="px-4 py-2.5 text-right">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        sb.isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                                      }`}
                                    >
                                      {sb.isActive ? "Active" : "Hidden"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-center text-xs text-zinc-500">
                        Agent has not configured custom prices yet (using default bundle prices).
                      </div>
                    )}
                  </div>

                  {/* Recent Store Orders */}
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 mb-2.5 flex items-center gap-2">
                      <Clock size={16} className="text-slate-600" />
                      Recent Store Orders ({selectedStoreData.recentOrders?.length || 0})
                    </h4>
                    {selectedStoreData.recentOrders && selectedStoreData.recentOrders.length > 0 ? (
                      <div className="overflow-x-auto border border-zinc-200 rounded-xl">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-zinc-50 text-zinc-500 font-semibold uppercase">
                            <tr>
                              <th className="px-4 py-2.5">Tx ID</th>
                              <th className="px-4 py-2.5">Package</th>
                              <th className="px-4 py-2.5">Recipient</th>
                              <th className="px-4 py-2.5">Price</th>
                              <th className="px-4 py-2.5">Status</th>
                              <th className="px-4 py-2.5 text-right">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {selectedStoreData.recentOrders.map((ord: any) => (
                              <tr key={ord._id} className="hover:bg-zinc-50">
                                <td className="px-4 py-2.5 font-mono text-zinc-600 truncate max-w-[120px]">
                                  {ord.transaction_id || ord.transactionId}
                                </td>
                                <td className="px-4 py-2.5 font-semibold text-zinc-900">
                                  {ord.bundleName} ({ord.network})
                                </td>
                                <td className="px-4 py-2.5 font-mono text-zinc-700">{ord.phoneNumber}</td>
                                <td className="px-4 py-2.5 font-bold text-zinc-900">{formatCurrency(ord.price)}</td>
                                <td className="px-4 py-2.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      ord.status === "delivered"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : ord.status === "failed"
                                        ? "bg-rose-50 text-rose-700"
                                        : "bg-amber-50 text-amber-700"
                                    }`}
                                  >
                                    {ord.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-right text-zinc-500">
                                  {new Date(ord.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-center text-xs text-zinc-500">
                        No orders recorded for this store yet.
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-4 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STORE MODAL */}
      {editModalOpen && editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Edit size={18} />
                </div>
                <h3 className="font-bold text-zinc-900 text-base">Edit Storefront</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={editForm.storeName}
                  onChange={(e) => setEditForm({ ...editForm, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Store Slug (URL Path)</label>
                <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden px-3 py-2 text-sm text-zinc-500 font-mono">
                  <span>/store/</span>
                  <input
                    type="text"
                    value={editForm.slug}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    className="w-full bg-transparent border-none text-zinc-900 font-mono text-sm focus:outline-none ml-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">WhatsApp Support Number</label>
                <input
                  type="text"
                  placeholder="e.g. 0551234567"
                  value={editForm.whatsappSupport}
                  onChange={(e) => setEditForm({ ...editForm, whatsappSupport: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 transition-colors font-medium"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <div>
                  <p className="font-bold text-zinc-900 text-xs">Storefront Status</p>
                  <p className="text-[11px] text-zinc-500">Enable or suspend public customer access</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-700 hover:bg-slate-800 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                {savingEdit && <div className="animate-spin h-3 w-3 border-b-2 border-white rounded-full" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE STORE CONFIRMATION MODAL */}
      {deleteModalOpen && deletingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-zinc-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-zinc-900">Delete Agent Store?</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Are you sure you want to permanently delete store{" "}
                <span className="font-bold text-zinc-900">"{deletingStore.storeName}"</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm"
              >
                {deleting && <div className="animate-spin h-3 w-3 border-b-2 border-white rounded-full" />}
                Delete Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
