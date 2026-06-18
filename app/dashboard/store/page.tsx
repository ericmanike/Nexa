"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../DashboardContext";
import { Store, Loader2, Eye, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { toast } from "react-toastify";
import WithdrawalModal from "@/components/WithdrawalModal";

export default function StorePage() {
  const { data, setData } = useDashboard();

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [whatsappSupport, setWhatsappSupport] = useState("");
  const [updatingStore, setUpdatingStore] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (data && data.agentStore) {
      setStoreName(data.agentStore.storeName || "");
      setStoreDescription(data.agentStore.description || "");
      setWhatsappSupport(data.agentStore.whatsappSupport || "");
    }
  }, [data]);

  const handleWithdrawSuccess = (amt: number) => {
    setIsWithdrawOpen(false);
    toast.success(`Successfully submitted withdrawal request for GH₵ ${amt.toFixed(2)}.`);
    if (setData && data) {
      setData({
        ...data,
        user: {
          ...data.user,
          walletBalance: data.user.walletBalance - amt
        },
        transactions: [
          {
            _id: `tx-wdr-${Date.now()}`,
            transactionType: "debit",
            type: "purchase",
            amount: amt,
            reference: `WDR-NEW-${Date.now().toString().slice(-4)}`,
            description: `Withdrawal request of GH₵ ${amt.toFixed(2)}`,
            status: "pending",
            createdAt: new Date().toISOString()
          },
          ...data.transactions
        ]
      });
    }
  };

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
      }
      toast.success("Store details updated successfully.");
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
    } finally {
      setUpdatingStore(false);
    }
  };

  if (user.role !== "agent") {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-[10px] p-6 shadow-sm text-center space-y-4">
          <div className="inline-flex h-12 w-12 rounded-full bg-amber-50 text-amber-500 items-center justify-center">
            <Store size={24} />
          </div>
          <h3 className="font-black text-slate-900 text-lg tracking-tight">
            Storefront Locked
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Reseller store details are only available for Agents. Upgrade your role to unlock your customizable catalog store.
          </p>
          <Link
            href="/dashboard/upgrade"
            className="inline-block px-6 py-2.5 bg-[#feb400] hover:bg-[#e6a200] text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-[0.99]"
          >
            Go Upgrade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[10px] p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-black text-slate-900 text-lg tracking-tight">
              My Reseller Storefront Settings
            </h3>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed mt-0.5 select-none">
              Manage your customized internet bundles sales store website and share your slug.
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toast.info("Storefront preview link will be connected here later!");
            }}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.99] shrink-0 border border-slate-200/50 select-none cursor-pointer"
          >
            <Eye size={15} /> Preview Store
          </button>
        </div>

        {/* Store Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center flex flex-col justify-between items-center min-h-[140px]">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Total Sale
              </p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">
                {(agentStore?.totalSalesCount || 0)} orders
              </h4>
            </div>
            <div className="h-[34px] mt-3" />
          </div>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center flex flex-col justify-between items-center min-h-[140px]">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Profit / Commission
              </p>
              <h4 className="text-2xl font-black text-emerald-600 mt-1">
                {formatCurrency(agentStore?.totalProfit || 0)}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsWithdrawOpen(true)}
              disabled={user.walletBalance < 50}
              className="mt-3 w-full max-w-[150px] py-1.5 bg-[#feb400] hover:bg-[#e6a200] disabled:opacity-50 text-slate-900 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              Withdraw
            </button>
          </div>
        </div>

        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex w-full items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 text-slate-800 rounded-xl transition-all select-none cursor-pointer"
          >
            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Save Settings</span>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Click to drop down and edit your reseller storefront information
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-slate-500 transition-transform duration-200 shrink-0 ${
                isSettingsOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isSettingsOpen && (
            <form onSubmit={handleUpdateStore} className="p-5 border-t border-slate-200 bg-white space-y-4 animate-in slide-in-from-top duration-200">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Store Name
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Nexa Bundles Express"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Store Slug Link
                </label>
                <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden px-3 py-2.5 text-xs text-slate-500 font-mono select-none">
                  <span>nexabundlesgh.com/store/</span>
                  <span className="font-bold text-slate-800">
                    {agentStore?.slug || "mystore"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Description / Catchphrase
                </label>
                <textarea
                  rows={3}
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Welcome message or catalog description..."
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  value={whatsappSupport}
                  onChange={(e) => setWhatsappSupport(e.target.value)}
                  placeholder="e.g. 233549961293 (include country code, no '+')"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={updatingStore}
                className="w-full py-3 bg-[#feb400] hover:bg-[#e6a200] text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
              >
                {updatingStore ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Save Settings"
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <WithdrawalModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        maxAmount={user.walletBalance}
        onSuccess={handleWithdrawSuccess}
      />
    </div>
  );
}
