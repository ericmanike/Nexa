"use client";

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";
import { Store, Eye, Settings, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { toast } from "react-toastify";
import WithdrawalModal from "@/components/WithdrawalModal";

export default function StorePage() {
  const { data, setData } = useDashboard();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

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


  const storeSlug = agentStore?.slug || "mystore";

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

          <Link
            href={`/store/${storeSlug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.99] shrink-0 border border-slate-200/50 select-none cursor-pointer"
          >
            <Eye size={15} /> Preview Store
          </Link>
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

        {/* Navigation Cards for Sub-Routes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Link
            href="/dashboard/store/settings"
            className="group relative flex flex-col justify-between p-6 bg-white hover:bg-slate-50/50 border border-slate-200/80 hover:border-[#feb400] rounded-2xl transition-all duration-300 shadow-sm active:scale-[0.99] select-none cursor-pointer overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-[#feb400]/10 text-[#feb400] flex items-center justify-center transition-colors">
                <Settings size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm tracking-tight">
                  Storefront Settings
                </h4>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-1">
                  Configure your reseller storefront name, custom domain slug, catchphrase description, and contact WhatsApp number.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-1 text-[11px] font-black text-slate-700 group-hover:text-slate-900 transition-colors">
              Configure Settings <span className="translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link
            href="/dashboard/store/prices"
            className="group relative flex flex-col justify-between p-6 bg-white hover:bg-slate-50/50 border border-slate-200/80 hover:border-[#feb400] rounded-2xl transition-all duration-300 shadow-sm active:scale-[0.99] select-none cursor-pointer overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-500/10 text-blue-500 flex items-center justify-center transition-colors">
                <Tag size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm tracking-tight">
                  Set Package Prices
                </h4>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-1">
                  Set your custom profit margin markup over original base prices, and control package visibility on your catalog.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-1 text-[11px] font-black text-slate-700 group-hover:text-slate-900 transition-colors">
              Manage Pricing <span className="translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
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
