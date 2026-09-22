"use client";

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";
import { Coins, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import WithdrawalModal from "@/components/WithdrawalModal";
import { toast } from "react-toastify";

export default function WithdrawPage() {
  const { data, setData, loading } = useDashboard();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-zinc-500" size={32} />
      </div>
    );
  }

  const { user, agentStore } = data;
  const storeProfit = agentStore?.totalProfit || 0;

  const handleWithdrawSuccess = (amt: number) => {
    setIsWithdrawOpen(false);
    toast.success(`Successfully submitted withdrawal request for GH₵ ${amt.toFixed(2)}.`);
    // Deduct locally from Context Provider!
    if (setData) {
      setData({
        ...data,
        agentStore: data.agentStore
          ? {
              ...data.agentStore,
              totalProfit: (data.agentStore.totalProfit || 0) - amt
            }
          : data.agentStore,
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[10px] p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-black text-slate-900 text-lg tracking-tight flex items-center gap-2">
            Reseller Profits & Rewards Cashout <Coins size={18} className="text-zinc-600 animate-spin" />
          </h3>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed mt-0.5 select-none">
            Submit a withdrawal request to transfer your earned store commissions directly into your Mobile Money wallet.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest select-none">
            Total Store Profit Balance
          </p>
          <h4 className="text-4xl font-black text-emerald-600 tracking-tight">
            {formatCurrency(storeProfit)}
          </h4>
          <p className="text-[11px] text-slate-400 select-none font-semibold">
            Minimum cashout threshold is GH₵ 1.00
          </p>
        </div>

        <button
          onClick={() => setIsWithdrawOpen(true)}
          disabled={(Number(storeProfit) || 0) < 1}
          className="w-full py-4 bg-[#feb400] hover:bg-[#e6a200] text-slate-900 font-bold tracking-wider uppercase text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          Withdraw Profits Now
        </button>
      </div>

      <WithdrawalModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        maxAmount={storeProfit}
        onSuccess={handleWithdrawSuccess}
      />
    </div>
  );
}
