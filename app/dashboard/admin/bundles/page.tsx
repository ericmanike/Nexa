"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Package, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bundleFilter, setBundleFilter] = useState<"all" | "user" | "agent" | "promo">("all");
  const [networkFilter, setNetworkFilter] = useState<"all" | "MTN" | "Telecel" | "AirtelTigo">("all");

  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<any>(null);
  const [bundleForm, setBundleForm] = useState({
    network: "MTN",
    name: "",
    price: "",
    isActive: true,
    audience: "user",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const res = await fetch("/api/bundles");
        if (res.ok) setBundles(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, []);

  const handleSaveBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingBundle ? `/api/bundles/${editingBundle._id}` : "/api/bundles";
      const method = editingBundle ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bundleForm, price: parseFloat(bundleForm.price) }),
      });
      if (res.ok) {
        const savedBundle = await res.json();
        if (editingBundle) {
          setBundles(bundles.map((b) => (b._id === savedBundle._id ? savedBundle : b)));
        } else {
          setBundles([...bundles, savedBundle]);
        }
        closeModal();
      } else {
        alert(editingBundle ? "Failed to update bundle" : "Failed to add bundle");
      }
    } catch {
      alert("Error saving bundle");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBundle = async (bundleId: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;
    try {
      const res = await fetch(`/api/bundles/${bundleId}`, { method: "DELETE" });
      if (res.ok) setBundles(bundles.filter((b) => b._id !== bundleId));
      else alert("Failed to delete bundle");
    } catch {
      alert("Error deleting bundle");
    }
  };

  const openEditModal = (bundle: any) => {
    setEditingBundle(bundle);
    setBundleForm({ network: bundle.network, name: bundle.name, price: bundle.price.toString(), isActive: bundle.isActive, audience: bundle.audience || "user" });
    setIsBundleModalOpen(true);
  };

  const openAddModal = () => {
    setEditingBundle(null);
    setBundleForm({ network: "MTN", name: "", price: "", isActive: true, audience: "user" });
    setIsBundleModalOpen(true);
  };

  const closeModal = () => {
    setIsBundleModalOpen(false);
    setEditingBundle(null);
    setBundleForm({ network: "MTN", name: "", price: "", isActive: true, audience: "user" });
  };

  const filtered = bundles.filter((bundle) => {
    const audienceMatch = bundleFilter === "all" || bundle.audience === bundleFilter;
    const networkMatch = networkFilter === "all" || bundle.network === networkFilter;
    return audienceMatch && networkMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* Add Bundle Modal */}
      {isBundleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-zinc-100">
              <h3 className="text-lg font-bold text-zinc-900">
                {editingBundle ? "Edit Bundle" : "Add New Bundle"}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveBundle} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Network</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none"
                  value={bundleForm.network}
                  onChange={(e) => setBundleForm({ ...bundleForm, network: e.target.value })}
                >
                  <option value="MTN">MTN</option>
                  <option value="Telecel">Telecel</option>
                  <option value="AirtelTigo">AirtelTigo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Target Audience</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none"
                  value={bundleForm.audience}
                  onChange={(e) => setBundleForm({ ...bundleForm, audience: e.target.value })}
                >
                  <option value="user">Regular User</option>
                  <option value="agent">Agent / Reseller</option>
                  <option value="promo">Promo Bundle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Bundle Name</label>
                <input
                  type="text"
                  placeholder="e.g. 1GB"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none"
                  value={bundleForm.name}
                  onChange={(e) => setBundleForm({ ...bundleForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Price (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none"
                  value={bundleForm.price}
                  onChange={(e) => setBundleForm({ ...bundleForm, price: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 text-slate-600 rounded border-gray-300"
                  checked={bundleForm.isActive}
                  onChange={(e) => setBundleForm({ ...bundleForm, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-zinc-700">Active Status</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors disabled:opacity-50">
                  {submitting ? (editingBundle ? "Updating..." : "Adding...") : (editingBundle ? "Update Bundle" : "Add Bundle")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Data Bundles</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Manage all available bundles</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-700 transition-all shadow-md shadow-slate-600/20 w-full sm:w-auto"
        >
          <Plus size={16} /> Add Bundle
        </button>
      </div>

      {/* Audience Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "user", "agent", "promo"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setBundleFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              bundleFilter === f
                ? f === "all" ? "bg-slate-600 text-white shadow-md"
                  : f === "user" ? "bg-gray-600 text-white shadow-md"
                  : f === "agent" ? "bg-green-600 text-white shadow-md"
                  : "bg-blue-600 text-white shadow-md"
                : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300"
            }`}
          >
            {f === "all" ? "All Bundles" : f === "user" ? "User Bundles" : f === "agent" ? "Agent Bundles" : "Promo Bundles"}
          </button>
        ))}
      </div>

      {/* Network Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "MTN", "Telecel", "AirtelTigo"] as const).map((n) => (
          <button
            key={n}
            onClick={() => setNetworkFilter(n)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              networkFilter === n
                ? n === "all" ? "bg-zinc-800 text-white shadow-md"
                  : n === "MTN" ? "bg-yellow-500 text-yellow-950 border-yellow-600"
                  : n === "Telecel" ? "bg-red-600 text-white border-red-700"
                  : "bg-blue-600 text-white border-blue-700"
                : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300"
            }`}
          >
            {n === "all" ? "All Networks" : n}
          </button>
        ))}
      </div>

      <Card className="border-zinc-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-800 whitespace-nowrap">
              <tr>
                <th className="px-6 py-4 font-medium border-b">Network</th>
                <th className="px-6 py-4 font-medium border-b">Bundle Name</th>
                <th className="px-6 py-4 font-medium border-b">Price (GHS)</th>
                <th className="px-6 py-4 font-medium border-b">Status</th>
                <th className="px-6 py-4 font-medium border-b">Audience</th>
                <th className="px-6 py-4 font-medium border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 whitespace-nowrap">
              {filtered.map((bundle) => (
                <tr key={bundle._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold uppercase min-w-[70px] text-center
                      ${bundle.network === "MTN" ? "bg-yellow-400 text-yellow-950" :
                        bundle.network === "Telecel" ? "bg-white text-red-600 border border-red-200" : "bg-blue-600 text-white"}`}>
                      {bundle.network}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-900 font-medium">{bundle.name}</td>
                  <td className="px-6 py-4 text-zinc-600">{formatCurrency(bundle.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bundle.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {bundle.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border
                      ${bundle.audience === "agent" ? "bg-purple-100 text-purple-700 border-purple-200" :
                        bundle.audience === "promo" ? "bg-blue-100 text-blue-700 border-blue-200" :
                          "bg-gray-100 text-gray-700 border-gray-200"}`}>
                      {bundle.audience === "agent" ? "Agent" : bundle.audience === "promo" ? "Promo" : "User"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEditModal(bundle)} className="p-2 text-zinc-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteBundle(bundle._id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <Package size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                    <p>No bundles found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
