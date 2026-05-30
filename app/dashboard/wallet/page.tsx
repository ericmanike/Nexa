"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { Wallet, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import TopUpWallet from "@/components/topUpwallet";

export default function WalletPage() {
  const { data } = useDashboard();

  if (!data) return null;

  const { user } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Available Wallet Balance
          </p>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">
            {formatCurrency(user.walletBalance)}
          </h3>
          <p className="text-xs font-semibold text-slate-400 select-none">
            Fast auto-topups credited instantly to your account.
          </p>
        </div>

        <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
          <TopUpWallet />
        </div>
      </div>

      {/* Wallet top-up details information banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex flex-col sm:flex-row gap-4 items-start text-blue-900">
        <AlertCircle size={24} className="shrink-0 text-blue-500 mt-1" />
        <div className="space-y-2">
          <h5 className="font-black text-sm">Need Help with Top-Ups?</h5>
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            We support automatic deposits via Mobile Money/Card using Paystack. If you prefer, manual Mobile Money transfers can also be processed. Send momo to **054 344 2518** (Eric Manike Haare) and **MUST** use your registered email address **{user.email}** as the reference.
          </p>
        </div>
      </div>
    </div>
  );
}
