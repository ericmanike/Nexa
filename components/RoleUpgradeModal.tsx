"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Store,
  TrendingUp,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Sparkles
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/app/dashboard/DashboardContext";
import TopUpWallet from "@/components/topUpwallet";
import { toast } from "react-toastify";

interface RoleUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  upgradeFee?: number;
}

export default function RoleUpgradeModal({
  isOpen,
  onClose,
  upgradeFee = 50,
}: RoleUpgradeModalProps) {
  const { update: updateSession } = useSession();
  const { data, setData, refresh } = useDashboard();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBalance = data?.user?.walletBalance || 0;
  const isAgent = data?.user?.role === "agent";
  const hasEnoughBalance = currentBalance >= upgradeFee;

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/role-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || resData.message || "Failed to upgrade role");
      }

      setSuccess("Congratulations! You are now an official Agent! 🚀");
      toast.success("Role upgraded to Agent successfully!");

      // Update NextAuth session token
      await updateSession();

      // Refresh Dashboard context
      if (refresh) {
        await refresh();
      } else if (data && setData) {
        setData({
          ...data,
          user: {
            ...data.user,
            role: "agent",
            walletBalance: resData.walletBalance ?? (currentBalance - upgradeFee),
          },
          ...(resData.agentStore ? { agentStore: resData.agentStore } : {}),
          ...(resData.transaction ? { transactions: [resData.transaction, ...data.transactions] } : {}),
        });
      }

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upgrade.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Top Decorative Banner */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
                <Sparkles size={24} />
              </div>
              <div>
         
                <h3 className="text-xl font-black tracking-tight text-white">
                  Become an Agent
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-lg font-black text-slate-900">{success}</h4>
              <p className="text-xs font-semibold text-slate-500">
                Unlocking cheaper agent bundle pricing & storefront capabilities...
              </p>
            </div>
          ) : isAgent ? (
            <div className="py-6 text-center space-y-3">
              <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck size={32} />
              </div>
              <h4 className="text-base font-black text-slate-900">
                You are already an Agent!
              </h4>
              <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                You already enjoy discounted agent pricing and reseller storefront privileges.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-red-50 text-red-800 text-xs font-bold rounded-2xl border border-red-100 flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Benefits list */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Agent Privilege Benefits
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                      <Zap size={18} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">Cheaper Agent Data Rates</h5>
                      <p className="text-[11px] text-slate-500">Access exclusive discounted prices for all networks</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
                      <Store size={18} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">Custom Reseller Storefront</h5>
                      <p className="text-[11px] text-slate-500">Sell internet packages with your custom storefront link</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">Earn Profits & Direct Payouts</h5>
                      <p className="text-[11px] text-slate-500">Markup package prices and withdraw profits to Mobile Money</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade Cost & Wallet Status */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">One-time Upgrade Fee</span>
                  <span className="font-black text-amber-400 text-base">{formatCurrency(upgradeFee)}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Wallet size={14} className="text-slate-400" /> Wallet Balance
                  </span>
                  <span className={`font-extrabold ${hasEnoughBalance ? "text-emerald-400" : "text-red-400"}`}>
                    {formatCurrency(currentBalance)}
                  </span>
                </div>
              </div>

              {/* Upgrade or TopUp Action */}
              {!hasEnoughBalance ? (
                <div className="space-y-2 text-center">
                  <p className="text-xs font-semibold text-red-500">
                    You need at least {formatCurrency(upgradeFee)} in your wallet to upgrade.
                  </p>
                  <div className="pt-1">
                    <TopUpWallet />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-4 bg-[#1e3a8a] hover:bg-blue-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Processing Upgrade...
                    </>
                  ) : (
                    <>
                      Pay {formatCurrency(upgradeFee)} 
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
