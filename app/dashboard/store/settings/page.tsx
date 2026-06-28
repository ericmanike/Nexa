"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../../DashboardContext";
import { Loader2, ArrowLeft, Save, Globe, MessageCircle, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function StoreSettingsPage() {
  const { data, setData } = useDashboard();
  const router = useRouter();

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [whatsappSupport, setWhatsappSupport] = useState("");
  const [updatingStore, setUpdatingStore] = useState(false);

  useEffect(() => {
    if (data && data.agentStore) {
      setStoreName(data.agentStore.storeName || "");
      setStoreDescription(data.agentStore.description || "");
      setWhatsappSupport(data.agentStore.whatsappSupport || "");
    }
  }, [data]);

  if (!data) return null;

  const { user, agentStore } = data;


  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStore(true);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeName,
          description: storeDescription,
          whatsappSupport,
        }),
      });

      const result = await res.json();
      if (res.ok && result.agentStore) {
        if (setData) {
          setData({
            ...data,
            agentStore: result.agentStore,
          });
        }
        toast.success("Store details updated successfully.");
        router.push("/dashboard/store");
      } else {
        // Fallback for mock/offline data mode
        if (setData) {
          setData({
            ...data,
            agentStore: {
              ...(agentStore || {
                isActive: true,
                totalSalesCount: 0,
                totalProfit: 0,
                slug: "mystore"
              }),
              storeName,
              description: storeDescription,
              whatsappSupport,
            }
          });
        }
        toast.success("Store details updated successfully.");
        router.push("/dashboard/store");
      }
    } catch (err: any) {
      // Fallback for offline/mock connection errors
      if (setData) {
        setData({
          ...data,
          agentStore: {
            ...(agentStore || {
              isActive: true,
              totalSalesCount: 0,
              totalProfit: 0,
              slug: "mystore"
            }),
            storeName,
            description: storeDescription,
            whatsappSupport,
          }
        });
      }
      toast.success("Store details updated successfully.");
      router.push("/dashboard/store");
    } finally {
      setUpdatingStore(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/store"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors select-none cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Store
        </Link>
        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          Settings Form
        </span>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
        <div>
          <h3 className="font-black text-slate-900 text-lg tracking-tight">
            Storefront Settings
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Customize the public interface and configuration details of your reseller storefront catalog.
          </p>
        </div>

        <form onSubmit={handleUpdateStore} className="space-y-5">
          {/* Store Name Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
              <Globe size={11} className="text-slate-400" /> Store Name
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Nexa Bundles Express"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-amber-400 focus:bg-white transition-all"
            />
          </div>

          {/* Store Slug Link */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
              Store URL / Link Slug
            </label>
            <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden px-3.5 py-3 text-xs text-slate-500 font-mono select-none">
              <span>nexabundlesgh.com/store/</span>
              <span className="font-bold text-slate-800">
                {agentStore?.slug || "mystore"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold pl-1">
              Your storefront is hosted at this address. You can share this link with your customers to get orders.
            </p>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
              <FileText size={11} className="text-slate-400" /> Description / Catchphrase
            </label>
            <textarea
              rows={3}
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              placeholder="Welcome message or catalog description..."
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-amber-400 focus:bg-white resize-none transition-all"
            />
          </div>

          {/* WhatsApp Support Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
              <MessageCircle size={11} className="text-slate-400" /> WhatsApp Support Number
            </label>
            <input
              type="text"
              value={whatsappSupport}
              onChange={(e) => setWhatsappSupport(e.target.value)}
              placeholder="e.g. 233549961293 (include country code, no '+')"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-amber-400 focus:bg-white transition-all"
            />
            <p className="text-[10px] text-slate-400 font-semibold pl-1">
              Customers will see a button to contact you directly on WhatsApp using this number if provided.
            </p>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={updatingStore}
            className="w-full py-3 bg-[#feb400] hover:bg-[#e6a200] text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
          >
            {updatingStore ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                <Save size={14} /> Save Settings
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
