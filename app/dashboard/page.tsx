"use client";

import React from "react";
import Link from "next/link";
import { useDashboard } from "./DashboardContext";
import {
  Wallet,
  ShoppingCart,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import TopUpWallet from "@/components/topUpwallet";

export default function DashboardOverviewPage() {
  const { data, error } = useDashboard();

  if (!data) return null;

  const { user, stats, orders, transactions } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-900 shadow-sm">
          <AlertCircle size={20} className="shrink-0 text-amber-500" />
          <div>
            <h5 className="font-bold text-sm">Notice / Safe Mode</h5>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Welcome Card */}
      <div className="relative bg-[#1e3a8a] rounded-[28px] p-6 sm:p-8 text-white overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 h-28 w-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="max-w-xl relative z-10 space-y-2">
       
          <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight capitalize">
            Hello, {user.name}!
          </h2>
          <p className="text-xs sm:text-sm text-gray-200 font-semibold leading-relaxed">
            Welcome to your Nexa Bundles GH Dakazina dashboard. Easily purchase non-expiry data bundles, manage orders, share referrals, or withdraw profits.
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Balance Widget */}
        <div className="bg-white  rounded-[10px] p-4 sm:p-6 shadow-lg flex flex-col justify-between gap-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Wallet Balance
              </p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                {formatCurrency(user.walletBalance)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
          </div>

          <div className="pt-2">
            <TopUpWallet />
          </div>
        </div>

        {/* Orders Overview */}
        <div className="bg-white rounded-[10px] p-4 sm:p-6 shadow-lg flex flex-col justify-between gap-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Total Orders
              </p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                {stats.totalOrders}{" "}
                <span className="text-xs font-semibold text-slate-400">
                  ({stats.processingOrders} active)
                </span>
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
          </div>
          <Link
            href="/dashboard/orders"
            className="w-full py-2.5 bg-[#fb923c] hover:bg-[#fb923a] rounded-xl text-slate-900 font-bold text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99]"
          >
            View All Orders <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Purchase Orders */}
      <div className="bg-white  rounded-[10px] p-4 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-[15px] sm:text-[17px] tracking-tight">
            Recent Purchase Orders
          </h3>
          <Link
            href="/dashboard/orders"
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            See All
          </Link>
        </div>

        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium text-center py-6">
              No orders recorded yet.
            </p>
          ) : (
            orders.slice(0, 4).map((ord) => (
              <div
                key={ord._id}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl hover:bg-slate-100/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      ord.network === "MTN"
                        ? "bg-[#ffcc00] text-slate-900"
                        : ord.network === "AirtelTigo"
                        ? "bg-[#0066b3] text-white"
                        : "bg-[#df0000] text-white"
                    }`}
                  >
                    {ord.network[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">
                      {ord.bundleName}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {ord.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-950 block">
                    {formatCurrency(ord.price)}
                  </span>
                  <span
                    className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                      ord.status === "delivered"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : ord.status === "processing" || ord.status === "pending"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-red-50 text-red-600 border border-red-100"
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
