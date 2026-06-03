"use client";

import { useState, useEffect } from "react";
import { Search, Store, ExternalLink, Activity, DollarSign, Package } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch("/api/admin/stores");
        if (res.ok) {
          const data = await res.json();
          console.log(data)
          setStores(data);

        }
      } catch (e) {
        console.error("Failed to fetch stores:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const filteredStores = stores.filter(
    (store) =>
      (store.storeName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (store.user?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (store.user?.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Agent Stores</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Monitor and manage all agent storefronts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-zinc-200 rounded-xl flex items-center gap-2">
            <Store size={16} className="text-slate-600" />
            <span className="text-sm font-bold text-zinc-900">{stores.length}</span>
            <span className="text-xs text-zinc-500 font-medium">Total Stores</span>
          </div>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white overflow-hidden">
        <div className="p-4 md:p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h3 className="text-base font-semibold text-zinc-900">Store Directory</h3>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Search by store name or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 focus:outline-none focus:border-slate-400 transition-colors w-full placeholder-zinc-400"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 font-medium">
              <tr>
                <th className="px-6 py-4">Store Name</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Sales</th>
                <th className="px-6 py-4">Profit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredStores.map((store) => (
                <tr key={store._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm border border-slate-200">
                        <Store size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">{store.storeName}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">/{store.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">{store.user?.name || "Unknown"}</span>
                      <span className="text-xs text-zinc-500">{store.user?.email || "No email"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Package size={14} className="text-zinc-400" />
                      <span className="font-semibold text-zinc-700">{store.totalSalesCount || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600">
                    {formatCurrency(store.totalProfit || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border ${
                      store.isActive 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {store.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-xs">
                    {new Date(store.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/store/${store.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-white hover:bg-slate-600 border border-slate-200 rounded-lg transition-all"
                    >
                      <ExternalLink size={14} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredStores.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    <Store size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                    <p>No stores found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 p-4">
          {filteredStores.map((store) => (
            <div key={store._id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                    <Store size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900">{store.storeName}</p>
                    <p className="text-xs text-zinc-500">{store.user?.name}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  store.isActive 
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {store.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-zinc-50 p-2.5 rounded-lg">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Sales</p>
                  <div className="flex items-center gap-1.5">
                    <Package size={14} className="text-zinc-400" />
                    <span className="font-bold text-zinc-900">{store.totalSalesCount || 0}</span>
                  </div>
                </div>
                <div className="bg-zinc-50 p-2.5 rounded-lg">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Profit</p>
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={14} className="text-green-600" />
                    <span className="font-bold text-green-600">{formatCurrency(store.totalProfit || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                <span className="text-[11px] text-zinc-400">
                  Created {new Date(store.createdAt).toLocaleDateString()}
                </span>
                <Link 
                  href={`/store/${store.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  <ExternalLink size={14} />
                  Visit Store
                </Link>
              </div>
            </div>
          ))}
          {filteredStores.length === 0 && (
            <div className="py-12 text-center text-zinc-500">
              <Store size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
              <p>No stores found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
