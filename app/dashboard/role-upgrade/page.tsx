"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../DashboardContext";
import {
  ShieldCheck,
  Zap,
  Store,
  TrendingUp,
  Sparkles,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import RoleUpgradeModal from "@/components/RoleUpgradeModal";
import Link from "next/link";

export default function RoleUpgradePage() {
  const { data } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upgradeFee, setUpgradeFee] = useState<number>(50);
  const [loadingFee, setLoadingFee] = useState<boolean>(true);

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await fetch("/api/role-upgrade");
        if (res.ok) {
          const resData = await res.json();
          if (resData.upgradeFee !== undefined) {
            setUpgradeFee(resData.upgradeFee);
          }
        }
      } catch (err) {
        console.error("Failed to fetch upgrade fee:", err);
      } finally {
        setLoadingFee(false);
      }
    };
    fetchFee();
  }, []);

  const user = data?.user || { name: "User", role: "user", walletBalance: 0 };
  const isAgent = user.role === "agent" || user.role === "admin" || user.role === "moderator";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative bg-gradient-to-br from-[#1e3a8a] via-[#172554] to-slate-950 rounded-[28px] p-6 sm:p-10 text-white overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold border border-amber-400/30">
            <Sparkles size={14} /> Account Role Upgrade
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Upgrade Your Account Role to <span className="text-amber-400">Agent Status</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed">
            Unlock maximum profits, access discounted wholesale data bundle pricing across all networks, and setup your personal reseller storefront.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 items-center">
            {isAgent ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500/20 text-emerald-300 rounded-2xl text-xs font-black border border-emerald-500/30">
                <CheckCircle2 size={18} /> Active Role: AGENT
              </div>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-amber-400/20 transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck size={18} /> Upgrade to Agent Now ({formatCurrency(upgradeFee)})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Zap size={24} />
          </div>
          <h4 className="font-black text-slate-900 text-base">Wholesale Discount Prices</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Enjoy exclusive low-tier data package costs for MTN, Telecel, and AirtelTigo, saving you money on every order.
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Store size={24} />
          </div>
          <h4 className="font-black text-slate-900 text-base">Personal Storefront</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Get your dedicated customizable online reseller store link where customers can purchase data packages from you directly.
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <TrendingUp size={24} />
          </div>
          <h4 className="font-black text-slate-900 text-base">Reseller Profits</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Set custom markup pricing on your storefront and withdraw generated commissions straight to Mobile Money.
          </p>
        </div>
      </div>

      {/* Details & Status Card */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h4 className="font-black text-slate-900 text-lg">Role Upgrade Overview</h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Review current status & wallet deduction details
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Upgrade Fee</span>
            <span className="text-xl font-black text-slate-900">{formatCurrency(upgradeFee)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Current Role</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-black uppercase">
              {user.role}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Wallet Balance</span>
            <span className="text-xs font-black text-slate-900">
              {formatCurrency(user.walletBalance)}
            </span>
          </div>
        </div>

        {!isAgent && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-semibold">
              The fee will be automatically deducted from your wallet balance upon upgrade.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Upgrade to Agent Role
            </button>
          </div>
        )}
      </div>

      <RoleUpgradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        upgradeFee={upgradeFee}
      />
    </div>
  );
}
