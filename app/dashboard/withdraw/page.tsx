"use client";

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";
import { Coins } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import WithdrawalModal from "@/components/WithdrawalModal";

export default function WithdrawPage() {
  const { data, setData } = useDashboard();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  if (!data) return null;

  const { user } = data;

  const handleWithdrawSuccess = (amt: number) => {
    setIsWithdrawOpen(false);
    alert(`Successfully submitted withdrawal request for GH₵ ${amt.toFixed(2)}.`);
    // Deduct locally from Context Provider!
    if (setData) {
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
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
            Total Active Balance
          </p>
          <h4 className="text-4xl font-black text-slate-950 tracking-tight">
            {formatCurrency(user.walletBalance)}
          </h4>
          <p className="text-[11px] text-slate-400 select-none font-semibold">
            Minimum cashout threshold is GH₵ 50.00
          </p>
        </div>

        <button
          onClick={() => setIsWithdrawOpen(true)}
          disabled={user.walletBalance < 50}
          className="w-full py-4 bg-[#feb400] hover:bg-[#e6a200] text-slate-900 font-bold tracking-wider uppercase text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          Withdraw Profits Now
        </button>
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
